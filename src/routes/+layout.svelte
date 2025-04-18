<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { A, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { BarsOutline } from 'flowbite-svelte-icons';
	import '../app.css';
	import AuthModal from '../lib/components/AuthModal.svelte';

	let { children } = $props();

	let showAuthModal = $state(false);
	let authMode = $state<'sign-in' | 'sign-up'>('sign-in');

	function openAuthModal(mode: 'sign-in' | 'sign-up') {
		showAuthModal = true;
		authMode = mode;
	}
	function closeAuthModal() {
		showAuthModal = false;
	}
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
	<nav class="relative z-1">
		<!-- Mobile: hamburger icon + dropdown menu -->
		<BarsOutline class="mobile-menu-trigger sm:hidden" aria-label="Open menu" />
		<Dropdown triggeredBy=".mobile-menu-trigger" class="w-25 sm:hidden">
			<DropdownItem><A href="{base}/find-partners">Find climbing partners</A></DropdownItem>
			<DropdownItem><A href="{base}/my-page">My page</A></DropdownItem>
			<DropdownItem><A onclick={() => openAuthModal('sign-in')}>Sign in</A></DropdownItem>
			<DropdownItem><A onclick={() => openAuthModal('sign-up')}>Sign up</A></DropdownItem>
			<DropdownItem slot="footer">Sign out</DropdownItem>
		</Dropdown>

		<!-- Desktop: horizontal menu list -->
		<ul class="hidden flex-row items-center gap-4 sm:flex">
			<li><A href="{base}/find-partners">Find climbing partners</A></li>
			<li><A href="{base}/my-page">My page</A></li>
			<li><A onclick={() => openAuthModal('sign-in')}>Sign in</A></li>
			<li><A onclick={() => openAuthModal('sign-up')}>Sign up</A></li>
		</ul>
	</nav>
</header>

<main class="flex-grow px-3 sm:px-6">
	{@render children()}
</main>

<AuthModal isOpen={showAuthModal} mode={authMode} onclose={closeAuthModal} />

<footer class="mt-5 bg-gray-200 p-3">
	<p class="text-center text-xs text-gray-500 md:text-sm">
		© 2025 Lyla Minju Park. All rights reserved.
	</p>
</footer>

<style>
</style>
