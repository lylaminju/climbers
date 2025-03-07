<script lang="ts">
	import { base } from '$app/paths';
	import ExternalLinkIcon from '$lib/icons/ExternalLinkIcon.svelte';
	import SortIcon from '$lib/icons/SortIcon.svelte';
	import { haversineDistance } from '$lib/utils/calculateDistance';
	import { toUSD } from '$lib/utils/convertCurrency';
	import {
		camelCaseToSpaceSeparatedWords,
		capitalizeFirstLetter,
		capitalizeWords,
	} from '$lib/utils/formatString';
	import { onMount } from 'svelte';
	import type { ClimbingGym, GymBoard, GymFeature } from '../types/types';

	let isMobile = $state(false);
	let userCoordinates = $state({ latitude: 43.6519307, longitude: -79.3847546 }); // Toronto City Hall
	onMount(() => {
		isMobile = window.innerWidth <= 640;

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
	});

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

	let selectedCity = $state('all');
	let selectedSortingOption = $state('nearest');
	let displayedGyms = $derived(
		data.gyms
			.filter((gym) => selectedCity === 'all' || gym.city.replace(/\s+/g, '-') === selectedCity)
			.sort((a, b) => {
				if (selectedSortingOption === 'name-asc') {
					return a.name.localeCompare(b.name);
				}
				if (selectedSortingOption === 'nearest') {
					return (
						haversineDistance(a.coordinates, userCoordinates) -
						haversineDistance(b.coordinates, userCoordinates)
					);
				}
				if (selectedSortingOption === 'farthest') {
					return (
						haversineDistance(b.coordinates, userCoordinates) -
						haversineDistance(a.coordinates, userCoordinates)
					);
				}
				if (selectedSortingOption === 'smallest') {
					return a.area.value - b.area.value;
				}
				if (selectedSortingOption === 'largest') {
					return b.area.value - a.area.value;
				}
				if (selectedSortingOption === 'cheapest') {
					return toUSD(a.price.amount, a.price.currency) - toUSD(b.price.amount, b.price.currency);
				}
				if (selectedSortingOption === 'expensive') {
					return toUSD(b.price.amount, b.price.currency) - toUSD(a.price.amount, a.price.currency);
				}
				return 0;
			}),
	);
</script>

<section id="filters" class="mb-3.5">
	<p class="font-fugaz hidden w-full text-xl text-slate-700 sm:block">Explore Climbing Gyms!</p>
	<div class="relative">
		<select
			name="cities"
			id="city"
			class="ease min-w-[100px] cursor-pointer appearance-none rounded border border-slate-200 py-2 pr-8 pl-3 text-xs text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-400 focus:shadow-md focus:outline-none sm:text-sm"
			aria-label="City filter"
			bind:value={selectedCity}
		>
			<option value="all" selected>All cities</option>

			{#each uniqueCities as city}
				<option value={city.replace(/\s+/g, '-')}>{capitalizeWords(city)}</option>
			{/each}
		</select>
		<SortIcon />
	</div>

	<div class="relative">
		<select
			name="sort-by"
			id="sort"
			class="ease min-w-[100px] cursor-pointer appearance-none rounded border border-slate-200 py-2 pr-8 pl-3 text-xs text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-400 focus:shadow-md focus:outline-none sm:text-sm"
			aria-label="Sorting options"
			bind:value={selectedSortingOption}
		>
			<option value="name-asc">Name Ascending</option>
			<option value="nearest" selected>Nearest Distance</option>
			<option value="farthest">Farthest Distance</option>
			<option value="smallest">Smallest Climbing Surface</option>
			<option value="largest">Largest Climbing Surface</option>
			<option value="cheapest">Price: Low to High</option>
			<option value="expensive">Price: High to Low</option>
			<!-- <option value="newest">Recently Opened</option>
			<option value="oldest">Oldest Opened</option> -->
		</select>
		<SortIcon />
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
				<img
					class="mb-0.5 h-6 w-6 rounded-full bg-white sm:mb-0 sm:h-10 sm:w-10"
					src="{base}/{gym.iconUrl}"
					alt={gym.name}
				/>
				<h2 class="text-base leading-[1.2] font-semibold sm:text-3xl sm:leading-[1.5]">
					{gym.name}
				</h2>
				<p class="text-xs sm:text-xl">{capitalizeWords(gym.city)}</p>
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
				class="gym-details no-scrollbar invisible cursor-pointer overflow-x-scroll rounded-2xl p-2 text-left text-sm leading-[1.5] text-nowrap sm:p-6 sm:text-2xl"
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
					{(Object.keys(gym.climbingTypes) as Array<keyof GymFeature>)
						.filter((feature) => gym.climbingTypes[feature]) // filtering only true
						.map((feature) => capitalizeFirstLetter(camelCaseToSpaceSeparatedWords(feature)))
						.join(', ')}
				</p>
				<p>
					🛹
					{#if gym.boards && Object.values(gym.boards).some((value) => value)}
						{(Object.keys(gym.boards) as Array<keyof GymBoard>)
							.filter((board) => gym.boards[board])
							.map((board) => capitalizeFirstLetter(camelCaseToSpaceSeparatedWords(board)))
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
	#filters {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
	}

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
