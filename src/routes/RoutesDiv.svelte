<script lang="ts">
	import { base } from '$app/paths';
	import { TravelModes } from '$lib/enums/TravelModes';
	import ChevronsRight from '$lib/icons/ChevronsRight.svelte';
	import BicyclingIcon from '$lib/icons/commutes/BicyclingIcon.svelte';
	import DrivingIcon from '$lib/icons/commutes/DrivingIcon.svelte';
	import TransitIcon from '$lib/icons/commutes/TransitIcon.svelte';
	import WalkingIcon from '$lib/icons/commutes/WalkingIcon.svelte';
	import CurrentLocation from '$lib/icons/CurrentLocation.svelte';
	import EllipsisVertical from '$lib/icons/EllipsisVertical.svelte';
	import MapPin from '$lib/icons/MapPin.svelte';
	import MapPinPlus from "$lib/icons/MapPinPlus.svelte";
	import { Tooltip } from 'flowbite-svelte';
	import { InfoCircleOutline } from "flowbite-svelte-icons";

	const { displayedGyms, isMobile, gymPlaceIds, searchRoutes } = $props();
</script>

<div
	id="routes"
	class="flex h-fit w-full flex-row items-center gap-3 gap-y-2 text-sm text-slate-700 transition duration-300 sm:min-w-0 sm:text-base"
>
	<div class="text-lg flex items-center gap-1">
		<InfoCircleOutline id="routes-info"/>
		<Tooltip triggeredBy="#routes-info" type="light" class="w-fit pl-6 sm:pl-7 sm:text-base">
			<ol class="list-decimal">
				<li>
					Add destinations by clicking on the map icon
					<MapPinPlus styles="w-4 inline"/><br/>
					(Remove destinations by clicking on the map icon)
				</li>
				<li>
					Select a travel mode
				</li>
			</ol>
		</Tooltip>
		<span class="hidden sm:inline">
			Compare routes 👉
		</span>
	</div>
	<div
		class="grid w-fit min-w-fit grid-cols-2 divide-slate-300 rounded-lg border border-slate-300 sm:grid-cols-4 sm:divide-x"
	>
		<button
			onclick={() => searchRoutes(TravelModes.DRIVING)}
			class="flex w-full cursor-pointer items-center justify-center px-2 py-1.5 hover:bg-slate-200 sm:px-3"
			aria-label="Search driving routes"
		>
			<DrivingIcon fillColor="#64748B" />
		</button>
		<Tooltip type="light">Driving</Tooltip>

		<button
			onclick={() => searchRoutes(TravelModes.PUBLIC_TRANSIT)}
			class="flex w-full cursor-pointer items-center justify-center px-2 py-1.5 hover:bg-slate-200 sm:px-3"
			aria-label="Search public transit routes"
		>
			<TransitIcon fillColor="#64748B" />
		</button>
		<Tooltip type="light">Transit</Tooltip>

		<button
			onclick={() => searchRoutes(TravelModes.BICYCLING)}
			class="flex w-full cursor-pointer items-center justify-center px-2 py-1.5 hover:bg-slate-200 sm:px-3"
			aria-label="Search bicycling routes"
		>
			<BicyclingIcon fillColor="#64748B" />
		</button>
		<Tooltip type="light">Bicycling</Tooltip>

		<button
			onclick={() => searchRoutes(TravelModes.WALKING)}
			class="flex w-full cursor-pointer items-center justify-center px-2 py-1.5 hover:bg-slate-200 sm:px-3"
			aria-label="Search walking routes"
		>
			<WalkingIcon fillColor="#64748B" />
		</button>
		<Tooltip type="light">Walking</Tooltip>
	</div>
	<div class="flex flex-col gap-y-0.5 overflow-x-hidden sm:flex-row sm:items-center sm:gap-x-2">
		<div class="flex flex-row items-center gap-1">
			<CurrentLocation styles="w-4 sm:w-5" />
			<span>Your location</span>
		</div>

		{#if isMobile}
			<EllipsisVertical />
		{:else}
			<ChevronsRight styles="w-5" />
		{/if}
		<div class="flex flex-row gap-1">
			{#if isMobile || gymPlaceIds.length === 0}
				<MapPin styles="w-4 sm:w-5" />
			{/if}
			<ul
				class="no-scrollbar flex min-h-6 w-fit flex-row items-center gap-1 overflow-x-scroll sm:min-w-0 sm:overflow-x-auto"
			>
				{#if gymPlaceIds.length === 0}
					<span class="text-slate-400">Add destinations</span>
				{/if}
				{#each displayedGyms as gym}
					{#if gymPlaceIds.includes(gym.placeId)}
						<li>
							<img
								class="h-6 w-6 min-w-6 rounded-full bg-white sm:h-8 sm:w-8 sm:min-w-8"
								src="{base}/{gym.iconUrl}"
								alt={gym.name}
								title={gym.name}
							/>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	</div>
</div>
