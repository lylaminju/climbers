<script lang="ts">
	import { base } from '$app/paths';
	import type { ClimbingGym, ClimbingType, GymBoard } from '$lib/types/types';
	import { formatCamelCase } from '$lib/utils/formatString';
	import { onMount } from 'svelte';

	const { displayedGyms }: { displayedGyms: ClimbingGym[] } = $props();

	let map: google.maps.Map;
	let mapContainer: HTMLDivElement;
	let markers: google.maps.Marker[] = []; // Track markers to clear them later

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	function loadGoogleMapsScript(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (typeof google !== 'undefined' && google.maps) {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
			script.async = true;
			script.defer = true;
			script.onload = () => resolve();
			script.onerror = () =>
				reject(new Error('Failed to load Google Maps script'));
			document.head.appendChild(script);
		});
	}

	// Update the map with new entities
	function updateMap() {
		// Clear existing markers
		markers.forEach((marker) => marker.setMap(null));
		markers = [];

		// If there's only one entity, set a default zoom
		if (displayedGyms.length === 1) {
			const firstGym = displayedGyms[0];
			map.setCenter({
				lat: firstGym.coordinates.latitude,
				lng: firstGym.coordinates.longitude,
			});
			map.setZoom(14); // Default zoom for a single point (adjust as needed)
			addMarker(firstGym);
			return;
		}

		// Calculate bounds to include all entities
		const bounds = new google.maps.LatLngBounds();
		displayedGyms.forEach((gym) => {
			bounds.extend({
				lat: gym.coordinates.latitude,
				lng: gym.coordinates.longitude,
			});
		});

		// Center and zoom the map to fit all markers
		map.fitBounds(bounds);

		// Add new markers
		displayedGyms.forEach((gym) => {
			addMarker(gym);
		});
	}

	function addMarker(gym: ClimbingGym) {
		const marker = new google.maps.Marker({
			position: {
				lat: gym.coordinates.latitude,
				lng: gym.coordinates.longitude,
			},
			map: map,
			title: gym.name,
		});

		const infoWindowContent = `
			<div
				class="w-full max-w-full bg-cover bg-center rounded-[8px] text-nowrap text-white text-sm sm:text-base"
				style="background-image: url(${base}/${gym.imageUrl});"
			>
				<div class="w-full h-fit max-w-full overflow-x-auto no-scrollbar rounded-[inherit] p-2 bg-black/60">
					<a
						class="flex w-fit flex-row hover:text-yellow-500"
						href=${gym.mapUrl}
						target="_blank"
					>
						<span class="mr-1">📍</span>
						<span class="underline decoration-1 underline-offset-2">${gym.address}</span>
					</a>
					<a
						class="flex w-fit flex-row hover:text-yellow-500"
						href=${gym.price.sourceUrl || gym.websiteUrl}
						target="_blank"
					>
						<span class="mr-1">💵</span>
						<span class="underline decoration-1 underline-offset-2">
							${gym.price.amount.toLocaleString('en-US', {
								style: 'currency',
								currency: gym.price.currency,
								minimumFractionDigits: 0,
							})}
							${gym.price.tax ? `+ ${gym.price.tax}` : ''}
						</span>
					</a>
					<p>
						🧗
						${(Object.keys(gym.climbingTypes) as Array<keyof ClimbingType>)
							.filter((feature) => gym.climbingTypes[feature]) // filtering only true
							.map((feature) => formatCamelCase(feature))
							.join(', ')}
					</p>
					<p>
						🛹
						${
							gym.boards && Object.values(gym.boards).some((value) => value)
								? (Object.keys(gym.boards) as Array<keyof GymBoard>)
										.filter((board) => gym.boards[board])
										.map((board) => formatCamelCase(board))
										.join(', ')
								: 'x'
						}
					</p>
					<div class="relative flex w-full flex-row justify-between items-center">
						<p>📐 ${gym.area.value ? `${gym.area.value.toLocaleString()} ${gym.area.unit}` : '-'}</p>
						<a class="fixed sm:relative right-5 sm:right-0 w-fit" href=${gym.websiteUrl} target="_blank">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18" height="18" viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M15 3h6v6" />
								<path d="M10 14 21 3" />
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
							</svg>
						</a>
					</div>
				</div>
			</div>
		`;
		const headerHtml = document.createElement('h1');
		headerHtml.className = 'mb-1 font-semibold text-base sm:text-xl';
		headerHtml.textContent = gym.name;

		const infoWindow = new google.maps.InfoWindow({
			headerContent: headerHtml,
			content: infoWindowContent,
		});

		marker.addListener('click', () => {
			infoWindow.open(map, marker);
		});

		markers.push(marker);
	}

	// Initialize the map
	async function initMap() {
		await loadGoogleMapsScript();

		map = new google.maps.Map(mapContainer);
		updateMap(); // Initial marker setup
	}

	// React to changes in entities
	$effect(() => {
		if (displayedGyms && map) {
			updateMap();
		}
	});

	// Load the map on mount
	onMount(() => {
		initMap();
	});
</script>

<div bind:this={mapContainer} class="h-[93vh] w-full"></div>
