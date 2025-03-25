<script lang="ts">
	import { base } from '$app/paths';
	import AddDestination from '$lib/icons/AddDestination.svelte';
	import ExternalLinkIcon from '$lib/icons/ExternalLinkIcon.svelte';
	import type { ClimbingType, GymBoard } from '$lib/types/types';
	import { capitalizeWords, formatCamelCase } from '$lib/utils/formatString';

	const { displayedGyms, isMobile, gymPlaceIds, toggleChildElementVisibility, handleDestination } =
		$props();
</script>

<section id="gyms">
	{#each displayedGyms as gym, _ (gym.id)}
		<div
			id="gym-card-{gym.id}"
			class="gym-card relative h-[145px] rounded-2xl bg-[#aaaaaa] bg-cover bg-center text-white sm:h-[270px]"
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
						target="_blank"
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
