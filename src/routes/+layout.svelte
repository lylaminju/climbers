<script lang="ts">
	import '../../static/app.css';
	let { children } = $props();
</script>

<header class="pt-4 pr-4 pl-4">
	<h1 class="font-fugaz text-5xl font-bold text-gray-900">
		<a href="/">Climbers'</a>
	</h1>
	<nav>
		<!-- <a href="www.google.com">Join Google Map Group</a> -->
	</nav>
</header>

<main class="flex-grow p-4">
	{@render children()}
</main>

<footer class="mt-5 bg-gray-200 p-5">
	<p class="text-center text-sm text-gray-500">
		© 2025 - {new Date().getFullYear()} Lyla Minju Park. All rights reserved.
	</p>
</footer>

<style>
</style>
