<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { TravelModes } from '$lib/enums/TravelModes';
	import AddDestination from '$lib/icons/AddDestination.svelte';
	import BicyclingIcon from '$lib/icons/commutes/BicyclingIcon.svelte';
	import DrivingIcon from '$lib/icons/commutes/DrivingIcon.svelte';
	import TransitIcon from '$lib/icons/commutes/TransitIcon.svelte';
	import WalkingIcon from '$lib/icons/commutes/WalkingIcon.svelte';
	import ExternalLinkIcon from '$lib/icons/ExternalLinkIcon.svelte';
	import type { ClimbingGym, ClimbingType, GymBoard } from '$lib/types/types';
	import { haversineDistance } from '$lib/utils/calculateDistance';
	import { toUSD } from '$lib/utils/convertCurrency';
	import { capitalizeWords, formatCamelCase } from '$lib/utils/formatString';
	import { Button, Checkbox, Dropdown, Search } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
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
<section id="gyms">
	{#each displayedGyms as gym, _ (gym.id)}
		<div
			id="gym-card-{gym.id}"
			class="gym-card h-[145px] rounded-2xl text-white sm:h-[270px]"
			style="background-image: url({base}/{gym.imageUrl})"
			onclick={() => toggleChildElementVisibility(gym.id)}
			onkeydown={() => toggleChildElementVisibility(gym.id)}
			role="button"
			tabindex="0"
		>
			<div class="gym-title p-2 text-center sm:p-3">
				<button
					class="absolute top-2 right-2 cursor-pointer sm:visible sm:z-10"
					onclick={(event) => handleDestination(event, gym.placeId)}
				>
					<AddDestination
						styles="sm:w-[24px] w-[18px] 
							{gymPlaceIds.includes(gym.placeId)
							? 'stroke-blue-600 fill-blue-200 hover:stroke-blue-600 hover:fill-none'
							: 'stroke-white-300 fill-none hover:stroke-blue-300'}
						"
					/>
				</button>
				<img
					class="mb-0.5 h-6 w-6 rounded-full bg-white sm:mb-0 sm:h-10 sm:w-10"
					src="{base}/{gym.iconUrl}"
					alt={gym.name}
				/>
				<h2 class="text-base leading-[1.2] font-semibold sm:text-3xl sm:leading-[1.5]">
					{gym.name}
				</h2>
				<p class="text-xs sm:text-xl sm:font-medium">{capitalizeWords(gym.city)}</p>
				<!-- <span class="rounded-2xl bg-transparent pt-1 pr-2 pb-1 pl-2 text-sm">
					{#if gym.climbingTypes.boulder}
						🪨
					{/if}
					{#if gym.climbingTypes.topRope || gym.climbingTypes.lead || gym.climbingTypes.autoBelay}
						🪢
					{/if}
				</span> -->
			</div>
			<button
				class="gym-details no-scrollbar invisible overflow-x-scroll rounded-2xl p-2 text-left text-sm leading-[1.5] text-nowrap sm:p-6 sm:text-2xl"
				onclick={() => !isMobile && window.open(gym.websiteUrl)}
			>
				<a
					class="flex w-fit flex-row hover:text-yellow-500"
					href={gym.mapUrl}
					target="_blank"
					onclick={(event) => event.stopPropagation()}
				>
					<span class="mr-1">📍</span>
					<span class="underline decoration-1 underline-offset-2">{gym.address}</span>
				</a>
				<a
					class="flex w-fit flex-row hover:text-yellow-500"
					href={gym.price.sourceUrl || gym.websiteUrl}
					target="_blank"
					onclick={(event) => event.stopPropagation()}
				>
					<span class="mr-1">💵</span>
					<span class="underline decoration-1 underline-offset-2">
						{gym.price.amount.toLocaleString('en-US', {
							style: 'currency',
							currency: gym.price.currency,
							minimumFractionDigits: 0,
						})}
						{#if gym.price.tax}+ {gym.price.tax}{/if}
					</span>
				</a>
				<p>
					🧗
					{(Object.keys(gym.climbingTypes) as Array<keyof ClimbingType>)
						.filter((feature) => gym.climbingTypes[feature]) // filtering only true
						.map((feature) => formatCamelCase(feature))
						.join(', ')}
				</p>
				<p>
					🛹
					{#if gym.boards && Object.values(gym.boards).some((value) => value)}
						{(Object.keys(gym.boards) as Array<keyof GymBoard>)
							.filter((board) => gym.boards[board])
							.map((board) => formatCamelCase(board))
							.join(', ')}
					{:else}
						x
					{/if}
				</p>
				<p>
					{#if gym.publicTransport}
						{#if gym.publicTransport.subway}
							🚇 Line {gym.publicTransport.subway.line}
							{capitalizeWords(gym.publicTransport.subway.station)}
						{:else if gym.publicTransport.busOrTram}
							🚌 Bus / Tram
						{:else}
							No public transport
						{/if}
					{/if}
				</p>
				<div class="flex w-full flex-row justify-between">
					<p>📐 {gym.area.value ? `${gym.area.value.toLocaleString()} ${gym.area.unit}` : '-'}</p>
					<a
						class="w-fit sm:hidden"
						href={gym.websiteUrl}
						onclick={(event) => event.stopPropagation()}
					>
						<ExternalLinkIcon />
					</a>
				</div>
			</button>
		</div>
	{/each}
</section>

<style>
	#gyms {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
	}

	.gym-card {
		background-color: #aaaaaa;
		background-size: cover;
		background-position: center;
		position: relative;

		.gym-title {
			position: absolute;
			top: 0;
			left: 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 100%;
			text-shadow: 1px 1px 4px rgba(0, 0, 0, 1);
		}

		.gym-details {
			position: absolute;
			top: 0;
			left: 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.7);
		}
	}

	@media (min-width: 640px) {
		#gyms {
			grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
			gap: 1.2rem;
		}

		.gym-card {
			&:hover .gym-title {
				visibility: hidden;
			}

			&:hover .gym-details {
				visibility: visible;
			}

			transition: visibility 0.3s ease;
		}
	}
</style>
