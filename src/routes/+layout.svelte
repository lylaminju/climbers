<script lang="ts">
	import { base } from '$app/paths';
	import MapIcon from '$lib/icons/MapIcon.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<header
	class="flex flex-row items-end items-start justify-between gap-3 px-3 pt-3 pb-1 sm:px-4 sm:pt-4"
>
	<div>
		<h1 class="font-fugaz text-4xl font-bold text-gray-900 sm:text-5xl">
			<a href="{base}/">RockClimberz</a>
		</h1>
		<p class="font-fugaz text-xs text-slate-500 md:text-xl">Explore Climbing Gyms!</p>
	</div>
	<nav>
		<a href="{base}/gmap-view">
			<MapIcon styles="w-6 sm:w-8 stroke-slate-500 hover:stroke-black" />
		</a>
	</nav>
</header>

<main class="flex-grow px-3 sm:px-4">
	{@render children()}
</main>

<footer class="mt-5 bg-gray-200 p-3">
	<p class="text-center text-xs text-gray-500 md:text-sm">
		© 2025 Lyla Minju Park. All rights reserved.
	</p>
</footer>

<style>
</style>
