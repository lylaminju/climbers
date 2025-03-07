<script lang="ts">
	import { base } from '$app/paths';
	import '../app.css';
	let { children } = $props();
</script>

<header class="pt-4 pr-4 pl-4">
	<h1 class="font-fugaz text-4xl font-bold text-gray-900 sm:text-5xl">
		<a href="{base}/">RockClimberz</a>
	</h1>
	<nav>
		<!-- <a href="www.google.com">Join Google Map Group</a> -->
	</nav>
</header>

<main class="flex-grow p-4 pt-1">
	{@render children()}
</main>

<footer class="mt-5 bg-gray-200 p-3">
	<p class="text-center text-xs text-gray-500 md:text-sm">
		© 2025 Lyla Minju Park. All rights reserved.
	</p>
</footer>

<style>
</style>
