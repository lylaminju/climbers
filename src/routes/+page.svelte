<script lang="ts">
	import { base } from '$app/paths';
	import ExternalLinkIcon from '$lib/icons/ExternalLinkIcon.svelte';
	import SortIcon from '$lib/icons/SortIcon.svelte';
	import capitalizeWords from '$lib/utils/capitalizeWords';
	import { onMount } from 'svelte';
	import type { ClimbingGym, GymBoard, GymFeature } from '../types/types';

	let isMobile = $state(false);
	onMount(() => {
		isMobile = window.innerWidth <= 640;
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
	{#each filteredGyms() as gym, _ (gym.id)}
		<div
			id="gym-card-{gym.id}"
			class="gym-card h-[170px] rounded-2xl text-white md:h-[300px]"
			style="background-image: url({base}/{gym.imageUrl})"
			onclick={() => toggleChildElementVisibility(gym.id)}
			onkeydown={() => toggleChildElementVisibility(gym.id)}
			role="button"
			tabindex="0"
		>
			<div class="gym-title text-center">
				<img class="h-10 w-10 rounded-full bg-white" src="{base}/{gym.iconUrl}" alt={gym.name} />
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
				class="gym-details invisible cursor-pointer rounded-2xl p-3 pb-3.5 text-left text-base md:p-6 md:text-2xl"
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
					💵 {gym.price.amount.toLocaleString('en-US', {
						style: 'currency',
						currency: gym.price.currency,
						minimumFractionDigits: 0,
					})}
					{#if gym.price.tax}+ {gym.price.tax}{/if}
				</a>
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
				<div class="flex w-full flex-row justify-between">
					<p>📏 {gym.area.value ? `${gym.area.value.toLocaleString()} ${gym.area.unit}` : '-'}</p>
					<a
						class="w-fit md:hidden"
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
		grid-template-columns: 1fr;
		gap: 1rem;
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
			text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
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
			grid-template-columns: repeat(auto-fill, minmax(430px, 1fr));
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
