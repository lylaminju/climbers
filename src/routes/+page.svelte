<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { GymsViewMode } from '$lib/enums/GymsViewMode';
	import { TravelModes } from '$lib/enums/TravelModes';
	import ImagesIcon from '$lib/icons/ImagesIcon.svelte';
	import MapIcon from '$lib/icons/MapIcon.svelte';
	import type { ClimbingGym, ClimbingType } from '$lib/types/types';
	import { haversineDistance } from '$lib/utils/calculateDistance';
	import { toUSD } from '$lib/utils/convertCurrency';
	import { loadGoogleMaps } from '$lib/utils/googleMapsLoader';
	import { Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import CityFilter from './CityFilter.svelte';
	import ClimbingTypeFilter from './ClimbingTypeFilter.svelte';
	import GymCardsSection from './GymCardsSection.svelte';
	import MapSection from './MapSection.svelte';
	import RoutesDiv from './RoutesDiv.svelte';
	import SortDropdown from './SortDropdown.svelte';

	let isMobile = $state(false);
	function updateIsMobile() {
		isMobile = window.innerWidth <= 640;
	}

	onMount(() => {
		// Set initial value
		updateIsMobile();
		setUserCoordinates();

		window.addEventListener('resize', updateIsMobile);

		// Cleanup function to remove event listener
		return () => {
			window.removeEventListener('resize', updateIsMobile);
		};
	});

	const userCoordinates = $state({
		latitude: 43.6519307,
		longitude: -79.3847546,
	}); // Toronto City Hall

	const DEFAULT_LOCATION_DISPLAY = 'Your location';
	let userLocationDisplay = $state('Locating...');

	async function reverseGeocode(lat: number, lng: number): Promise<string> {
		try {
			const maps = await loadGoogleMaps();
			const geocoder = new maps.Geocoder();

			const response = await geocoder.geocode({
				location: { lat, lng },
			});

			if (response.results.length > 0) {
				const result = response.results[0];
				let streetNumber = '';
				let route = '';

				for (const component of result.address_components) {
					if (component.types.includes('street_number')) {
						streetNumber = component.short_name;
					}
					if (component.types.includes('route')) {
						route = component.short_name;
					}
				}

				if (route) {
					return streetNumber ? `${streetNumber} ${route}` : route;
				}
			}
		} catch (error) {
			console.error('Reverse geocoding failed:', error);
		}

		return DEFAULT_LOCATION_DISPLAY;
	}

	async function setUserCoordinates() {
		try {
			const position = await new Promise<GeolocationPosition>(
				(resolve, reject) => {
					if (!navigator.geolocation) {
						reject(new Error('Geolocation not supported'));
						return;
					}
					navigator.geolocation.getCurrentPosition(resolve, reject);
				}
			);

			userCoordinates.latitude = position.coords.latitude;
			userCoordinates.longitude = position.coords.longitude;
			userLocationDisplay = await reverseGeocode(
				position.coords.latitude,
				position.coords.longitude
			);
		} catch (error) {
			console.error('Location error: ', error);
			userLocationDisplay = DEFAULT_LOCATION_DISPLAY;
		}
	}

	function toggleChildElementVisibility(id: number) {
		if (!isMobile) return;

		const gymTitle: HTMLElement | null = document.querySelector(
			`#gym-card-${id.toString()} .gym-title`
		);
		const gymDetails: HTMLElement | null = document.querySelector(
			`#gym-card-${id.toString()} .gym-details`
		);
		if (gymTitle && gymDetails) {
			gymTitle.style['visibility'] =
				getComputedStyle(gymTitle).visibility == 'visible'
					? 'hidden'
					: 'visible';
			gymDetails.style['visibility'] =
				getComputedStyle(gymDetails).visibility == 'hidden'
					? 'visible'
					: 'hidden';
		} else {
			console.log('gymTitle or gymDetails not found');
		}
	}

	const { data }: { data: { gyms: ClimbingGym[] } } = $props();
	const uniqueCities = [...new Set(data.gyms.map((gym) => gym.city))].sort();

	const cities = $state(
		uniqueCities.map((city) => ({ name: city, checked: false }))
	);

	const climbingType: ClimbingType = $state({
		boulder: false,
		autoBelay: false,
		topRope: false,
		lead: false,
	});

	let selectedSortingOption = $state('nearest');
	function handleSortChange(value: string) {
		selectedSortingOption = value;
	}
	let displayedGyms = $derived.by(() => {
		const filteredGyms = data.gyms.filter((gym) => {
			const matchesCity = cities.some(
				(city) => city.checked && city.name === gym.city
			);
			const hasCityFilter = cities.some((city) => city.checked);

			const matchesClimbingTypes = Object.entries(climbingType).every(
				([type, isSelected]) => {
					if (isSelected) {
						return gym.climbingTypes[type as keyof ClimbingType] === true;
					}
					// Unselected types are excluded
					return true;
				}
			);
			const hasClimbingFilter = Object.values(climbingType).some(
				(isSelected) => isSelected
			);

			return (
				(!hasCityFilter || matchesCity) && // Pass if no city filter or city matches
				(!hasClimbingFilter || matchesClimbingTypes) // Pass if no climbing filter or climbing type matches
			);
		});

		return [...filteredGyms].sort((a, b) => {
			switch (selectedSortingOption) {
				case 'name-asc':
					return a.name.localeCompare(b.name);
				case 'name-desc':
					return b.name.localeCompare(a.name);
				case 'nearest':
					return (
						haversineDistance(a.coordinates, userCoordinates) -
						haversineDistance(b.coordinates, userCoordinates)
					);
				case 'farthest':
					return (
						haversineDistance(b.coordinates, userCoordinates) -
						haversineDistance(a.coordinates, userCoordinates)
					);
				case 'smallest':
					return a.area.value - b.area.value;
				case 'largest':
					return b.area.value - a.area.value;
				case 'cheapest':
					return (
						toUSD(a.price.amount, a.price.currency) -
						toUSD(b.price.amount, b.price.currency)
					);
				case 'expensive':
					return (
						toUSD(b.price.amount, b.price.currency) -
						toUSD(a.price.amount, a.price.currency)
					);
				default:
					return 0;
			}
		});
	});

	const gymPlaceIds: string[] = $state([]);

	function handleDestination(event: MouseEvent, gymPlaceId: string) {
		event.stopPropagation();

		const index = gymPlaceIds.indexOf(gymPlaceId);
		if (index === -1) {
			gymPlaceIds.push(gymPlaceId);
		} else {
			gymPlaceIds.splice(index, 1);
		}
	}

	function searchRoutes(travelMode: TravelModes) {
		const placeIdsString = JSON.stringify(gymPlaceIds);
		goto(
			`${base}/gmap-route?travelMode=${travelMode}&placeIds=${encodeURIComponent(placeIdsString)}`
		);
	}

	let gymsViewMode: GymsViewMode = $state(GymsViewMode.CARD);

	function handleViewMode(viewMode: GymsViewMode) {
		gymsViewMode = viewMode;
	}
</script>

<section
	class="mt-4 mb-3 flex w-full flex-col gap-y-2 lg:mb-4 lg:flex-row lg:items-center lg:gap-x-3"
>
	<RoutesDiv
		{displayedGyms}
		{isMobile}
		{gymPlaceIds}
		{searchRoutes}
		{userLocationDisplay}
	/>

	<div class="flex w-full flex-row gap-2 sm:w-fit">
		<ClimbingTypeFilter {climbingType} {isMobile} />

		<CityFilter {cities} {isMobile} />

		<SortDropdown {selectedSortingOption} onSortChange={handleSortChange} />

		<Button
			class="px-2.5 py-1 sm:px-4"
			onclick={() => {
				handleViewMode(
					gymsViewMode === GymsViewMode.CARD
						? GymsViewMode.MAP
						: GymsViewMode.CARD
				);
			}}
			aria-label={gymsViewMode}
		>
			{#if gymsViewMode === GymsViewMode.CARD}
				<MapIcon styles="w-4 sm:w-5 stroke-white" />
			{:else}
				<ImagesIcon styles="w-4 sm:w-5 stroke-white" />
			{/if}
		</Button>
	</div>
</section>
{#if gymsViewMode == GymsViewMode.CARD}
	<GymCardsSection
		{displayedGyms}
		{isMobile}
		{gymPlaceIds}
		{toggleChildElementVisibility}
		{handleDestination}
	/>
{:else if gymsViewMode == GymsViewMode.MAP}
	<MapSection {displayedGyms} />
{/if}
