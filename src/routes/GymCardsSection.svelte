<script lang="ts">
	import { base } from '$app/paths';
	import ExternalLinkIcon from '$lib/icons/ExternalLinkIcon.svelte';
	import MapPin from '$lib/icons/MapPin.svelte';
	import MapPinPlus from '$lib/icons/MapPinPlus.svelte';
	import type { ClimbingType, GymBoard } from '$lib/types/types';
	import { capitalizeWords, formatCamelCase } from '$lib/utils/formatString';

	const {
		displayedGyms,
		isMobile,
		gymPlaceIds,
		toggleChildElementVisibility,
		handleDestination,
	} = $props();
</script>

<section id="gyms">
	{#each displayedGyms as gym, _ (gym.id)}
		<div
			id="gym-card-{gym.id}"
			class="gym-card relative h-[145px] rounded-2xl bg-[#aaaaaa] bg-cover bg-center text-white sm:h-[220px]"
			style="background-image: url({base}/{gym.imageUrl})"
			onclick={() => toggleChildElementVisibility(gym.id)}
			onkeydown={() => toggleChildElementVisibility(gym.id)}
			role="button"
			tabindex="0"
		>
			<button
				id="add-destination-{gym.id}"
				class="group absolute top-2 right-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-sm transition-all duration-200 hover:w-auto hover:justify-end hover:bg-white hover:pr-2 hover:pl-3 hover:shadow-md sm:h-10 sm:w-10"
				onclick={(event) => handleDestination(event, gym.placeId)}
				aria-label="Add or delete a destination"
			>
				<span
					class="hidden pr-1 text-xs font-medium whitespace-nowrap text-slate-600 group-hover:inline sm:text-sm"
				>
					{gymPlaceIds.includes(gym.placeId) ? 'Remove' : 'Compare routes'}
				</span>
				{#if gymPlaceIds.includes(gym.placeId)}
					<MapPin styles="w-5 sm:w-6 stroke-blue-600 fill-blue-200" />
				{:else}
					<MapPinPlus
						styles="w-5 sm:w-6 stroke-slate-600 fill-none group-hover:stroke-blue-500"
					/>
				{/if}
			</button>
			<div class="gym-title p-2 text-center sm:p-3">
				<img
					class="mb-0.5 h-6 w-6 rounded-full bg-white sm:mb-0 sm:h-8 sm:w-8"
					src="{base}/{gym.iconUrl}"
					alt={gym.name}
				/>
				<h2
					class="text-base leading-[1.2] font-semibold sm:text-2xl sm:leading-[1.5]"
				>
					{gym.name}
				</h2>
				<p class="text-xs sm:text-lg sm:font-medium">
					{capitalizeWords(gym.city)}
				</p>
			</div>
			<div
				class="gym-details no-scrollbar invisible cursor-pointer overflow-x-auto overflow-y-hidden rounded-2xl p-2 text-left text-sm leading-[1.5] text-nowrap sm:p-6 sm:text-xl"
				onclick={() => !isMobile && window.open(gym.websiteUrl)}
				onkeydown={() => !isMobile && window.open(gym.websiteUrl)}
				role="link"
				tabindex="0"
			>
				<div class="flex items-center gap-1">
					<a
						class="flex w-fit flex-row hover:text-yellow-500"
						href={gym.price.sourceUrl || gym.websiteUrl}
						target="_blank"
						onclick={(event) => event.stopPropagation()}
					>
						<span class="mr-1">💵</span>
						<span class="underline decoration-1 underline-offset-2">
							Pricing
						</span>
						<!-- <span class="underline decoration-1 underline-offset-2">
							{gym.price.amount.toLocaleString('en-US', {
								style: 'currency',
								currency: gym.price.currency,
								minimumFractionDigits: 0,
							})}
							{#if gym.price.tax}+ {gym.price.tax}{/if}
						</span> -->
					</a>
					<!-- <InfoCircleOutline
						id={`price-info-${gym.id}`}
						class="w-4 opacity-50 sm:w-6"
						onclick={(event) => event.stopPropagation()}
					/>
					<Tooltip
						type="light"
						triggeredBy={`#price-info-${gym.id}`}
						class="w-full whitespace-normal sm:w-[250px]"
					>
						Price might be subject to change. Please check the exact price on
						the climbing gym's website.
					</Tooltip> -->
				</div>

				<a
					class="flex w-fit flex-row hover:text-yellow-500"
					href={gym.mapUrl}
					target="_blank"
					onclick={(event) => event.stopPropagation()}
				>
					<span class="mr-1">📍</span>
					<span class="underline decoration-1 underline-offset-2">
						{gym.address}
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
						🚇
						{#if gym.publicTransport.subway}
							Line {gym.publicTransport.subway.line}
							{capitalizeWords(gym.publicTransport.subway.station)}
						{:else}
							-
						{/if}
					{/if}
				</p>
				<div class="flex w-full flex-row justify-between">
					<!-- <p>
						📐 {gym.area.value
							? `${gym.area.value.toLocaleString()} ${gym.area.unit}`
							: '-'}
					</p> -->
					<a
						class="w-fit sm:hidden"
						href={gym.websiteUrl}
						target="_blank"
						onclick={(event) => event.stopPropagation()}
					>
						<ExternalLinkIcon />
					</a>
				</div>
			</div>
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
			grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
