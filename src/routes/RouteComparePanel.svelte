<script lang="ts">
	import { base } from '$app/paths';
	import { TravelModes } from '$lib/enums/TravelModes';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import ChevronLeft from '$lib/icons/ChevronLeft.svelte';
	import ChevronRight from '$lib/icons/ChevronRight.svelte';
	import ChevronUp from '$lib/icons/ChevronUp.svelte';
	import BicyclingIcon from '$lib/icons/commutes/BicyclingIcon.svelte';
	import DrivingIcon from '$lib/icons/commutes/DrivingIcon.svelte';
	import TransitIcon from '$lib/icons/commutes/TransitIcon.svelte';
	import WalkingIcon from '$lib/icons/commutes/WalkingIcon.svelte';
	import CurrentLocation from '$lib/icons/CurrentLocation.svelte';
	import MapPin from '$lib/icons/MapPin.svelte';
	import MapPinPlus from '$lib/icons/MapPinPlus.svelte';
	import XIcon from '$lib/icons/XIcon.svelte';
	import type { ClimbingGym } from '$lib/types/types';
	import { Tooltip } from 'flowbite-svelte';

	interface Props {
		gymPlaceIds: string[];
		displayedGyms: ClimbingGym[];
		userLocationDisplay: string;
		searchRoutes: (travelMode: TravelModes) => void;
		onRemoveGym: (placeId: string) => void;
	}

	const {
		gymPlaceIds,
		displayedGyms,
		userLocationDisplay,
		searchRoutes,
		onRemoveGym,
	}: Props = $props();

	let isExpanded = $state(false);
	let hasAutoExpandedOnce = $state(false);

	// Auto-expand on first gym add
	$effect(() => {
		if (gymPlaceIds.length > 0 && !hasAutoExpandedOnce) {
			isExpanded = true;
			hasAutoExpandedOnce = true;
		}
	});

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}

	const selectedGyms = $derived(
		displayedGyms.filter((gym) => gymPlaceIds.includes(gym.placeId))
	);

	const hasGymsSelected = $derived(gymPlaceIds.length > 0);

	const travelModeDisabled = $derived(!hasGymsSelected);
</script>

<!-- Mobile Bottom Panel (< 1024px) -->
<div
	class="fixed right-0 bottom-0 left-0 z-50 border-t border-slate-200 bg-white shadow-lg transition-all duration-300 lg:hidden"
	style="padding-bottom: env(safe-area-inset-bottom, 0px);"
>
	<!-- Collapsed/Header Bar -->
	<button
		class="flex w-full cursor-pointer items-center justify-between px-4 py-3"
		onclick={toggleExpanded}
		aria-label={isExpanded ? 'Collapse route panel' : 'Expand route panel'}
	>
		<div class="flex items-center gap-2">
			<MapPin styles="w-5 text-blue-600" />
			{#if hasGymsSelected}
				<span class="font-medium text-slate-700">
					Compare routes ({gymPlaceIds.length} selected)
				</span>
			{:else}
				<span class="font-medium text-slate-700">Compare routes</span>
			{/if}
		</div>
		{#if isExpanded}
			<ChevronDown styles="w-5 text-slate-500" />
		{:else}
			<ChevronUp styles="w-5 text-slate-500" />
		{/if}
	</button>

	<!-- Expanded Content -->
	{#if isExpanded}
		<div class="border-t border-slate-100 px-4 pb-4">
			<!-- From location -->
			<div class="flex items-center gap-2 py-3 text-sm">
				<CurrentLocation styles="w-4 text-slate-500" />
				<span class="text-slate-600">From: {userLocationDisplay}</span>
			</div>

			<!-- Selected gyms -->
			<div class="mb-3">
				<span class="mb-2 block text-xs text-slate-500">To:</span>
				{#if selectedGyms.length === 0}
					<p class="flex items-center gap-1 text-sm text-slate-400">
						Tap <MapPinPlus styles="w-4 inline" /> on gyms to add
					</p>
				{:else}
					<div class="flex flex-wrap gap-2">
						{#each selectedGyms as gym (gym.placeId)}
							<div
								class="flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pr-1 pl-2"
							>
								<img
									class="h-5 w-5 rounded-full bg-white"
									src="{base}/{gym.iconUrl}"
									alt={gym.name}
								/>
								<span class="max-w-[100px] truncate text-sm">{gym.name}</span>
								<button
									class="rounded-full p-0.5 hover:bg-slate-200"
									onclick={() => onRemoveGym(gym.placeId)}
									aria-label="Remove {gym.name}"
								>
									<XIcon styles="w-4 text-slate-500" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Travel mode buttons -->
			<div
				class="grid grid-cols-4 divide-x divide-slate-200 rounded-lg border border-slate-200"
			>
				<button
					onclick={() => searchRoutes(TravelModes.DRIVING)}
					class="flex cursor-pointer items-center justify-center px-3 py-2.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
					aria-label="Search driving routes"
					disabled={travelModeDisabled}
				>
					<DrivingIcon fillColor={travelModeDisabled ? '#94A3B8' : '#64748B'} />
				</button>

				<button
					onclick={() => searchRoutes(TravelModes.PUBLIC_TRANSIT)}
					class="flex cursor-pointer items-center justify-center px-3 py-2.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
					aria-label="Search public transit routes"
					disabled={travelModeDisabled}
				>
					<TransitIcon fillColor={travelModeDisabled ? '#94A3B8' : '#64748B'} />
				</button>

				<button
					onclick={() => searchRoutes(TravelModes.BICYCLING)}
					class="flex cursor-pointer items-center justify-center px-3 py-2.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
					aria-label="Search bicycling routes"
					disabled={travelModeDisabled}
				>
					<BicyclingIcon
						fillColor={travelModeDisabled ? '#94A3B8' : '#64748B'}
					/>
				</button>

				<button
					onclick={() => searchRoutes(TravelModes.WALKING)}
					class="flex cursor-pointer items-center justify-center px-3 py-2.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
					aria-label="Search walking routes"
					disabled={travelModeDisabled}
				>
					<WalkingIcon fillColor={travelModeDisabled ? '#94A3B8' : '#64748B'} />
				</button>
			</div>
		</div>
	{/if}
</div>

<!-- Desktop Right Side Panel (>= 1024px) -->
<div
	class="fixed top-0 right-0 bottom-0 z-40 hidden border-l border-slate-200 bg-white shadow-lg transition-all duration-300 lg:block"
	class:w-[280px]={isExpanded}
	class:w-[60px]={!isExpanded}
>
	<!-- Collapsed state -->
	{#if !isExpanded}
		<button
			class="flex h-full w-full cursor-pointer flex-col items-center pt-4"
			onclick={toggleExpanded}
			aria-label="Expand route panel"
		>
			<MapPin styles="w-6 text-blue-600" />
			{#if hasGymsSelected}
				<div class="mt-3 flex flex-col items-center gap-1.5">
					{#each selectedGyms as gym (gym.placeId)}
						<img
							class="h-7 w-7 rounded-full bg-white"
							src="{base}/{gym.iconUrl}"
							alt={gym.name}
						/>
					{/each}
				</div>
			{/if}
			<div class="mt-4">
				<ChevronLeft styles="w-5 text-slate-400" />
			</div>
		</button>
	{:else}
		<!-- Expanded state -->
		<div class="flex h-full flex-col">
			<!-- Header -->
			<div
				class="flex items-center justify-between border-b border-slate-100 px-4 py-3"
			>
				<div class="flex items-center gap-2">
					<MapPin styles="w-5 text-blue-600" />
					<span class="font-medium text-slate-700">Compare routes</span>
				</div>
				<button
					class="cursor-pointer rounded p-1 hover:bg-slate-100"
					onclick={toggleExpanded}
					aria-label="Collapse route panel"
				>
					<ChevronRight styles="w-5 text-slate-500" />
				</button>
			</div>

			<!-- Travel mode buttons (fixed at top) -->
			<div class="px-4 pt-4">
				<div
					class="grid grid-cols-4 divide-x divide-slate-200 rounded-lg border border-slate-200"
				>
					<button
						id="travel-driving"
						onclick={() => searchRoutes(TravelModes.DRIVING)}
						class="flex cursor-pointer items-center justify-center px-3 py-2.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
						aria-label="Search driving routes"
						disabled={travelModeDisabled}
					>
						<DrivingIcon
							fillColor={travelModeDisabled ? '#94A3B8' : '#64748B'}
						/>
					</button>
					<Tooltip triggeredBy="#travel-driving" type="light" class="z-50">
						Driving
					</Tooltip>

					<button
						id="travel-transit"
						onclick={() => searchRoutes(TravelModes.PUBLIC_TRANSIT)}
						class="flex cursor-pointer items-center justify-center px-3 py-2.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
						aria-label="Search public transit routes"
						disabled={travelModeDisabled}
					>
						<TransitIcon
							fillColor={travelModeDisabled ? '#94A3B8' : '#64748B'}
						/>
					</button>
					<Tooltip triggeredBy="#travel-transit" type="light" class="z-50">
						Transit
					</Tooltip>

					<button
						id="travel-bicycling"
						onclick={() => searchRoutes(TravelModes.BICYCLING)}
						class="flex cursor-pointer items-center justify-center px-3 py-2.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
						aria-label="Search bicycling routes"
						disabled={travelModeDisabled}
					>
						<BicyclingIcon
							fillColor={travelModeDisabled ? '#94A3B8' : '#64748B'}
						/>
					</button>
					<Tooltip triggeredBy="#travel-bicycling" type="light" class="z-50">
						Bicycling
					</Tooltip>

					<button
						id="travel-walking"
						onclick={() => searchRoutes(TravelModes.WALKING)}
						class="flex cursor-pointer items-center justify-center px-3 py-2.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
						aria-label="Search walking routes"
						disabled={travelModeDisabled}
					>
						<WalkingIcon
							fillColor={travelModeDisabled ? '#94A3B8' : '#64748B'}
						/>
					</button>
					<Tooltip triggeredBy="#travel-walking" type="light" class="z-50">
						Walking
					</Tooltip>
				</div>
			</div>

			<!-- Scrollable Content -->
			<div class="flex-1 overflow-y-auto p-4">
				<!-- From location -->
				<div class="mb-4">
					<span class="mb-1 block text-xs font-medium text-slate-500"
						>From:</span
					>
					<div class="flex items-center gap-2">
						<CurrentLocation styles="w-4 text-slate-500" />
						<span class="text-sm text-slate-700">{userLocationDisplay}</span>
					</div>
				</div>

				<!-- To destinations -->
				<div>
					<span class="mb-2 block text-xs font-medium text-slate-500">To:</span>
					{#if selectedGyms.length === 0}
						<p class="flex items-center gap-1 text-sm text-slate-400">
							Click <MapPinPlus styles="w-4 inline" /> on gyms to add
						</p>
					{:else}
						<div class="space-y-2">
							{#each selectedGyms as gym (gym.placeId)}
								<div
									class="flex items-center justify-between rounded-lg bg-slate-50 p-2"
								>
									<div class="flex items-center gap-2">
										<img
											class="h-6 w-6 rounded-full bg-white"
											src="{base}/{gym.iconUrl}"
											alt={gym.name}
										/>
										<span class="max-w-[160px] truncate text-sm"
											>{gym.name}</span
										>
									</div>
									<button
										class="cursor-pointer rounded p-1 hover:bg-slate-200"
										onclick={() => onRemoveGym(gym.placeId)}
										aria-label="Remove {gym.name}"
									>
										<XIcon styles="w-4 text-slate-500" />
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
