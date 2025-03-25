<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { TravelModes } from '$lib/enums/TravelModes';
	import BicyclingIcon from '$lib/icons/commutes/BicyclingIcon.svelte';
	import DrivingIcon from '$lib/icons/commutes/DrivingIcon.svelte';
	import TransitIcon from '$lib/icons/commutes/TransitIcon.svelte';
	import WalkingIcon from '$lib/icons/commutes/WalkingIcon.svelte';
	import type { ClimbingGym, ClimbingType } from '$lib/types/types';
	import { haversineDistance } from '$lib/utils/calculateDistance';
	import { toUSD } from '$lib/utils/convertCurrency';
	import { capitalizeWords, formatCamelCase } from '$lib/utils/formatString';
	import { Button, Checkbox, Dropdown, Search } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import GymCardsSection from './GymCardsSection.svelte';
	import SortDropdown from './SortDropdown.svelte';

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
</script>

<section class="mb-3 flex w-full flex-col gap-y-1 sm:mb-4 sm:flex-row sm:items-center sm:gap-x-3">
	<div
		id="routes"
		class="flex h-fit w-full flex-col transition duration-300 sm:min-w-0 sm:flex-row sm:gap-3"
	>
		<div class="flex min-w-fit items-center text-center text-sm text-slate-700">
			<img src="{base}/google-map-icon.png" alt="Google Map Icon" width="20" />
			<span class="mr-2 ml-1 text-nowrap sm:mr-3">Routes ({gymPlaceIds.length})</span>

			<div
				class="flex w-full flex-row divide-x divide-slate-300 rounded-md border border-slate-300 sm:min-h-[38px] sm:w-fit sm:min-w-fit sm:divide-slate-200 sm:border-slate-200 sm:shadow-sm"
			>
				<button
					onclick={() => searchRoutes(TravelModes.DRIVING)}
					class="flex w-full cursor-pointer items-center justify-center p-1 hover:bg-slate-200 sm:px-3"
				>
					<DrivingIcon fillColor="#64748B" />
				</button>
				<button
					onclick={() => searchRoutes(TravelModes.PUBLIC_TRANSIT)}
					class="flex w-full cursor-pointer items-center justify-center hover:bg-slate-200 sm:px-3"
				>
					<TransitIcon fillColor="#64748B" />
				</button>
				<button
					onclick={() => searchRoutes(TravelModes.BICYCLING)}
					class="flex w-full cursor-pointer items-center justify-center hover:bg-slate-200 sm:px-3"
				>
					<BicyclingIcon fillColor="#64748B" />
				</button>
				<button
					onclick={() => searchRoutes(TravelModes.WALKING)}
					class="flex w-full cursor-pointer items-center justify-center hover:bg-slate-200 sm:px-3"
				>
					<WalkingIcon fillColor="#64748B" />
				</button>
			</div>
		</div>
		<ul
			class="no-scrollbar flex w-full max-w-full flex-row items-center gap-2 overflow-x-scroll p-2 sm:min-w-0 sm:grow sm:overflow-x-auto"
		>
			{#each displayedGyms as gym}
				<li>
					<img
						class="h-6 w-6 min-w-6 rounded-full bg-white sm:h-8 sm:w-8 sm:min-w-8
							{gymPlaceIds.includes(gym.placeId) ? 'opacity-100' : 'opacity-20'}
						"
						src="{base}/{gym.iconUrl}"
						alt={gym.name}
						title={gym.name}
					/>
				</li>
			{/each}
		</ul>
	</div>
	<div id="filter-sort" class="flex w-full flex-row gap-2 sm:w-fit">
		<Button class="text-nowrap">
			{isMobile
				? '🧗'
				: `${
						Object.values(climbingType).every((v) => !v)
							? 'Climbing Types'
							: Object.entries(climbingType)
									.filter(([type, isSelected]) => isSelected)
									.map(([type]) => formatCamelCase(type))
									.join(', ')
					}`}
			<ChevronDownOutline class="ms-2 h-6 w-6 text-white dark:text-white" />
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
		<Button>
			Cities<ChevronDownOutline class="ms-2 h-6 w-6 text-white dark:text-white" />
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
	</div>
</section>

<GymCardsSection
	{displayedGyms}
	{isMobile}
	{gymPlaceIds}
	{toggleChildElementVisibility}
	{handleDestination}
/>
