<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import MapIcon from '$lib/icons/MapIcon.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<header
	style="background-image: url({base}/wall-paper.jpeg)"
	class="relative flex flex-row items-start justify-between gap-3
		{page.url.pathname === `${base}/` ? 'h-100 sm:h-[50vh]' : 'h-fit'} 
		mb-2.5 bg-cover bg-top px-3 py-4 sm:mb-4 sm:px-6 sm:pt-6
	"
>
	<div class="absolute inset-0 bg-black/20"></div>
	{#if page.url.pathname === `${base}/`}
		<div
			class="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-b from-transparent to-[#f0f0f0] sm:h-[0%]"
		></div>
	{/if}
	<div class="z-1 sm:flex sm:h-full sm:flex-col sm:justify-center">
		<h1
			class="
				{page.url.pathname === `${base}/` ? 'sm:text-6xl' : 'sm:text-5xl'}
				font-fugaz text-4xl font-bold text-gray-900 text-white
			"
		>
			<a href="{base}/" data-sveltekit-reload>ClimberzDay</a>
		</h1>
		<p class="font-fugaz text-xs text-white opacity-50 sm:text-xl">Explore Climbing Gyms!</p>
	</div>
	<nav class="z-1">
		<a href="{base}/gmap-view">
			<MapIcon styles="w-6 sm:w-8 stroke-white hover:stroke-slate-500" />
		</a>
	</nav>
</header>

<main class="flex-grow px-3 sm:px-6">
	{@render children()}
</main>

<footer class="mt-5 bg-gray-200 p-3">
	<p class="text-center text-xs text-gray-500 md:text-sm">
		© 2025 Lyla Minju Park. All rights reserved.
	</p>
</footer>

<style>
</style>
