<script lang="ts">
	import { base } from '$app/paths';
	import type { ClimbingGym } from '$lib/types/types';
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
			script.onerror = () => reject(new Error('Failed to load Google Maps script'));
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
			map.setCenter({ lat: firstGym.coordinates.latitude, lng: firstGym.coordinates.longitude });
			map.setZoom(14); // Default zoom for a single point (adjust as needed)
			addMarker(firstGym);
			return;
		}

		// Calculate bounds to include all entities
		const bounds = new google.maps.LatLngBounds();
		displayedGyms.forEach((gym) => {
			bounds.extend({ lat: gym.coordinates.latitude, lng: gym.coordinates.longitude });
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
			position: { lat: gym.coordinates.latitude, lng: gym.coordinates.longitude },
			map: map,
			title: gym.name,
		});

		const infoWindowContent = `
			<div
				style="background-image: url(${base}/${gym.imageUrl})"
				class="bg-cover bg-center text-white p-2"
			>
				<h1 class="font-semibold text-sm sm:text-xl">${gym.name}</h1>
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
				<a href="${gym.mapUrl}">Google Map</a>
			</div>
		`;
		const infoWindow = new google.maps.InfoWindow({ content: infoWindowContent });

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

<div bind:this={mapContainer} class="h-screen w-full"></div>
