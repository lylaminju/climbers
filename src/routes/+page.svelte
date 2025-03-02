<script lang="ts">
	import SortIcon from '$lib/SortIcon.svelte';
	import { onMount } from 'svelte';
	import type { ClimbingGym, GymBoard, GymFeature } from '../types/types';
	import capitalizeWords from '$lib/utils/capitalizeWords';

	let isMobile = $state(false);
	onMount(() => {
		isMobile = window.innerWidth <= 640;
	});

	const { data }: { data: { gyms: ClimbingGym[] } } = $props();
	const uniqueCities = [...new Set(data.gyms.map((gym) => gym.city))].sort();

	let selectedCity = $state('all');

	function filteredGyms() {
		return data.gyms
			.filter((gym) => selectedCity === 'all' || gym.city.replace(/\s+/g, '-') === selectedCity)
			.sort((a, b) => a.city.localeCompare(b.city)); // Sort gyms alphabetically by city name
	}
</script>

<section id="filters" class="mb-3">
	<p class="font-fugaz hidden w-full text-xl text-slate-700 md:block">Explore Climbing Gyms!</p>
	<div class="relative">
		<select
			name="cities"
			id="city"
			class="ease min-w-[100px] cursor-pointer appearance-none rounded border border-slate-200 py-2 pr-8 pl-3 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-400 focus:shadow-md focus:outline-none"
			bind:value={selectedCity}
		>
			<option value="all" selected>All cities</option>

			{#each uniqueCities as city}
				<option value={city.replace(/\s+/g, '-')}>{capitalizeWords(city)}</option>
			{/each}
		</select>
		<SortIcon />

		<use href="../../static/select-arrow.svg#icon"></use>
	</div>

	<div class="relative">
		<select
			name="sort-by"
			id="sort"
			class="ease min-w-[100px] cursor-pointer appearance-none rounded border border-slate-200 py-2 pr-8 pl-3 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-400 focus:shadow-md focus:outline-none"
			aria-label="Sort options"
		>
			<option value="default" disabled selected>Sort by</option>
			<option value="smallest">Smallest Area</option>
			<option value="largest">Largest Area</option>
			<option value="cheapest">Price: Low to High</option>
			<option value="expensive">Price: High to Low</option>
			<option value="newest">Recently Opened</option>
			<option value="oldest">Oldest Opened</option>
		</select>
		<SortIcon />
	</div>
</section>
<section id="gyms">
	{#each filteredGyms() as gym}
		<div
			class="gym-card h-[200px] rounded-2xl text-white md:h-[300px]"
			style="background-image: url({gym.imageUrl})"
		>
			<div class="gym-title text-center">
				<img class="h-10 w-10 rounded-full bg-white" src={gym.iconUrl} alt={gym.name} />
				<h2 class="text-2xl md:text-3xl">{gym.name}</h2>
				<p class="text-base md:text-xl">{capitalizeWords(gym.city)}</p>
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
				class="gym-details cursor-pointer rounded-2xl pr-3 pl-3 text-left text-base md:p-6 md:text-2xl"
				onclick={() => !isMobile && window.open(gym.websiteUrl)}
			>
				<a
					class="w-fit hover:text-yellow-500"
					href={gym.mapUrl}
					target="_blank"
					onclick={(event) => event.stopPropagation()}
				>
					📍 {gym.address}
				</a>
				<a
					class="w-fit hover:text-yellow-500"
					href={gym.price.sourceUrl || gym.websiteUrl}
					target="_blank"
					onclick={(event) => event.stopPropagation()}
				>
					💵 {gym.price.currency}
					{gym.price.amount}
					{#if gym.price.tax}+ {gym.price.tax}{/if}
				</a>
				{#if gym.area.value !== 0}
					<p>📏 {gym.area.value.toLocaleString()} {gym.area.unit}</p>
				{/if}
				<p>
					🧗
					{(Object.keys(gym.climbingTypes) as Array<keyof GymFeature>)
						.filter((feature) => gym.climbingTypes[feature]) // filtering only true
						.map((feature) => feature.replace(/([A-Z])/g, ' $1').toLowerCase()) // converting camelCase to space-separated words
						.join(', ')}
				</p>
				<p>
					🛹
					{#if gym.boards && Object.values(gym.boards).some((value) => value)}
						{(Object.keys(gym.boards) as Array<keyof GymBoard>)
							.filter((board) => gym.boards[board])
							.map((board) => board.replace(/([A-Z])/g, ' $1').toLowerCase())
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
				<a
					class="mt-2 rounded-xl bg-yellow-600 pt-0.5 pb-0.5 text-center text-sm md:invisible"
					href={gym.websiteUrl}
					onclick={(event) => event.stopPropagation()}
				>
					Go to the website
				</a>
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
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.gym-card {
		background-color: #aaaaaa;
		background-size: cover;
		background-position: center;
		position: relative;

		&:hover {
			background-color: rgba(0, 0, 0, 0.5);
		}

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
			text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
		}

		&:hover .gym-title {
			opacity: 0;
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
			opacity: 0;
			visibility: hidden;
		}

		&:hover .gym-details {
			opacity: 1;
			visibility: visible;
		}
	}

	@media (min-width: 640px) {
		#gyms {
			grid-template-columns: repeat(auto-fill, minmax(430px, 1fr));
		}

		.gym-details {
			opacity: 0;
			visibility: hidden;
			transition:
				opacity 0.3s ease,
				visibility 0.3s ease;
		}
	}
</style>
