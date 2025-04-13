<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { GymsViewMode } from '$lib/enums/GymsViewMode';
	import { TravelModes } from '$lib/enums/TravelModes';
	import ClimberIcon from '$lib/icons/ClimberIcon.svelte';
	import ImagesIcon from '$lib/icons/ImagesIcon.svelte';
	import MapIcon from '$lib/icons/MapIcon.svelte';
	import type { ClimbingGym, ClimbingType } from '$lib/types/types';
	import { haversineDistance } from '$lib/utils/calculateDistance';
	import { toUSD } from '$lib/utils/convertCurrency';
	import { capitalizeWords, formatCamelCase } from '$lib/utils/formatString';
	import { Button, Checkbox, Dropdown, Search } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import GymCardsSection from './GymCardsSection.svelte';
	import MapSection from './MapSection.svelte';
	import RoutesDiv from './RoutesDiv.svelte';
	import SortDropdown from './SortDropdown.svelte';

	let gymsViewMode: GymsViewMode = $state(GymsViewMode.CARD);
	let isMobile = $state(false);
	function updateIsMobile() {
		isMobile = window.innerWidth <= 640;
	}
	let userCoordinates = $state({ latitude: 43.6519307, longitude: -79.3847546 }); // Toronto City Hall

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

	function setUserCoordinates() {
		try {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position: GeolocationPosition) => {
						userCoordinates.latitude = position.coords.latitude;
						userCoordinates.longitude = position.coords.longitude;
					},
					() => console.log('Unable to retrieve the location'),
				);
			} else {
				console.log('Geolocation is not supported by your browser');
			}
		} catch (error) {
			console.error(`navigator error: ${error}`);
		}
	}

	function toggleChildElementVisibility(id: number) {
		if (!isMobile) return;

		const gymTitle: HTMLElement | null = document.querySelector(
			`div#gym-card-${id.toString()} div.gym-title`,
		);
		const gymDetails: HTMLElement | null = document.querySelector(
			`div#gym-card-${id.toString()} button.gym-details`,
		);
		if (gymTitle && gymDetails) {
			gymTitle.style['visibility'] =
				getComputedStyle(gymTitle).visibility == 'visible' ? 'hidden' : 'visible';
			gymDetails.style['visibility'] =
				getComputedStyle(gymDetails).visibility == 'hidden' ? 'visible' : 'hidden';
		} else {
			console.log('gymTitle or gymDetails not found');
		}
	}

	const { data }: { data: { gyms: ClimbingGym[] } } = $props();
	const uniqueCities = [...new Set(data.gyms.map((gym) => gym.city))].sort();

	let searchTerm = $state('');
	const cities = $state(uniqueCities.map((city) => ({ name: city, checked: false })));
	let filteredCities = $derived(
		cities.filter((city) => city.name.toLowerCase().includes(searchTerm?.toLowerCase() ?? '')),
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
			const matchesCity = cities.some((city) => city.checked && city.name === gym.city);
			const hasCityFilter = cities.some((city) => city.checked);

			const matchesClimbingTypes = Object.entries(climbingType).every(([type, isSelected]) => {
				if (isSelected) {
					return gym.climbingTypes[type as keyof ClimbingType] === true;
				}
				// Unselected types are excluded
				return true;
			});
			const hasClimbingFilter = Object.values(climbingType).some((isSelected) => isSelected);

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
					return toUSD(a.price.amount, a.price.currency) - toUSD(b.price.amount, b.price.currency);
				case 'expensive':
					return toUSD(b.price.amount, b.price.currency) - toUSD(a.price.amount, a.price.currency);
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
			`${base}/gmap-route?travelMode=${travelMode}&placeIds=${encodeURIComponent(placeIdsString)}`,
		);
	}

	function handleViewMode(viewMode: GymsViewMode) {
		gymsViewMode = viewMode;
	}
</script>

<section class="mb-3 flex w-full flex-col gap-y-2 lg:mb-4 lg:flex-row lg:items-center lg:gap-x-3">
	<RoutesDiv {displayedGyms} {isMobile} {gymPlaceIds} {searchRoutes} />

	<div class="flex w-full flex-row gap-2 sm:w-fit">
		<Button class="dropdown-btn text-nowrap">
			{#if isMobile}
				<ClimberIcon styles="w-5 stroke-white fill-white" />
			{:else}
				{Object.values(climbingType).every((v) => !v)
					? 'Climbing Types'
					: Object.entries(climbingType)
							.filter(([type, isSelected]) => isSelected)
							.map(([type]) => formatCamelCase(type))
							.join(', ')}
			{/if}
			<ChevronDownOutline class="ms-0 h-6 w-6 text-white sm:ms-2 dark:text-white" />
		</Button>
		<Dropdown class="w-48 space-y-1 p-2 text-sm sm:p-3">
			<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
				<Checkbox bind:checked={climbingType.boulder}>Boulder</Checkbox>
			</li>
			<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
				<Checkbox bind:checked={climbingType.autoBelay}>Auto belay</Checkbox>
			</li>
			<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
				<Checkbox bind:checked={climbingType.topRope}>Top rope</Checkbox>
			</li>
			<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
				<Checkbox bind:checked={climbingType.lead}>Lead</Checkbox>
			</li>
		</Dropdown>

		<Button class="dropdown-btn">
			Cities<ChevronDownOutline class="ms-1 h-6 w-6 text-white sm:ms-2 dark:text-white" />
		</Button>
		<Dropdown class="h-44 overflow-y-auto px-3 pb-3 text-sm sm:h-50">
			<div slot="header" class="p-3">
				<Search size="md" bind:value={searchTerm} />
			</div>
			{#each filteredCities as city (city.name)}
				<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
					<Checkbox bind:checked={city.checked}>{capitalizeWords(city.name)}</Checkbox>
				</li>
			{/each}
		</Dropdown>

		<SortDropdown {selectedSortingOption} onSortChange={handleSortChange} />

		<Button
			class="px-2.5 py-1 sm:px-4"
			onclick={() => {
				handleViewMode(gymsViewMode === GymsViewMode.CARD ? GymsViewMode.MAP : GymsViewMode.CARD);
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
