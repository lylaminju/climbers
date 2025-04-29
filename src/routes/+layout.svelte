<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import type { Subscription } from '@supabase/supabase-js';
	import { A, Dropdown, DropdownItem, Toast } from 'flowbite-svelte';
	import {
		ArrowRightToBracketOutline,
		BarsOutline,
		UserCircleOutline,
	} from 'flowbite-svelte-icons';
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';
	import AuthModal from '../lib/components/AuthModal.svelte';

	let { children } = $props();

	let listener: { subscription: Subscription } | undefined = undefined;

	onMount(async () => {
		// Initial fetch
		const { data } = await supabase.auth.getUser();
		userStore.set(data.user);

		// Listen for auth state changes
		const { data: listenerData } = supabase.auth.onAuthStateChange(
			(event, session) => {
				userStore.set(session?.user ?? null);
			},
		);

		// Store the listener
		listener = listenerData;
	});

	onDestroy(() => {
		listener?.subscription.unsubscribe();
	});

	let showAuthModal = $state(false);
	let authMode = $state<'sign-in' | 'sign-up'>('sign-in');
	let showSignOutErrorToast = $state(false);

	function openAuthModal(mode: 'sign-in' | 'sign-up') {
		showAuthModal = true;
		authMode = mode;
	}
	function closeAuthModal() {
		showAuthModal = false;
	}

	async function handleSignOut() {
		try {
			await supabase.auth.signOut();
		} catch (error) {
			showSignOutErrorToast = true;
			console.error('Error signing out:', error);
		}
	}
</script>

{#if showSignOutErrorToast}
	<Toast
		onclose={() => (showSignOutErrorToast = false)}
		class="fixed top-4 right-4 z-50 rounded-md text-red-600"
	>
		Error signing out. Please try again.
	</Toast>
{/if}

<header
	style="background-image: url({base}/wall-paper.jpeg)"
	class="relative flex flex-row items-start justify-between gap-3
		{page.url.pathname === `${base}/`
		? 'h-100 min-h-100 sm:h-[50vh] sm:min-h-[50vh]'
		: 'h-fit'} 
		mb-2.5 bg-cover bg-top px-3 py-4 sm:mb-4 sm:px-6 sm:pt-6
	"
>
	<!-- Overlay a semi-transparent black layer over the header background image for better text readability in mobile -->
	<div class="absolute inset-0 bg-black/20"></div>

	{#if page.url.pathname === `${base}/`}
		<!-- Show a gradient at the bottom of the header on the homepage for a smooth visual transition in mobile -->
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
		{#if page.url.pathname === `${base}/`}
			<p class="font-fugaz text-xs text-white opacity-50 sm:text-xl">
				Explore Climbing Gyms!
			</p>
		{/if}
	</div>
	<nav class="relative z-1">
		<!-- Mobile: hamburger icon + dropdown menu -->
		<BarsOutline class="mobile-menu-trigger sm:hidden" aria-label="Open menu" />
		<Dropdown triggeredBy=".mobile-menu-trigger" class="w-25 sm:hidden">
			<DropdownItem>
				<A href="{base}/find-partners">Find climbing partners</A>
			</DropdownItem>
			{#if $userStore}
				<DropdownItem>
					<A href="{base}/profile/{$userStore?.user_metadata?.username}">
						My page
					</A>
				</DropdownItem>
				<DropdownItem slot="footer" onclick={handleSignOut}>
					Sign out
				</DropdownItem>
			{:else}
				<DropdownItem>
					<A onclick={() => openAuthModal('sign-in')}>Sign in</A>
				</DropdownItem>
				<DropdownItem>
					<A onclick={() => openAuthModal('sign-up')}>Sign up</A>
				</DropdownItem>
			{/if}
		</Dropdown>

		<!-- Desktop: horizontal menu list -->
		<ul class="hidden flex-row items-center gap-4 sm:flex">
			<li><A href="{base}/find-partners">Find climbing partners</A></li>
			{#if $userStore}
				<li>
					<A
						href="{base}/profile/{$userStore?.user_metadata?.username}"
						title="My page"
						class="flex items-center gap-1"
					>
						<UserCircleOutline aria-label="My page" />
						{$userStore.user_metadata?.username}
					</A>
				</li>
				<li>
					<button
						class="flex items-center"
						title="Sign out"
						onclick={handleSignOut}
						aria-label="Sign out"
					>
						<ArrowRightToBracketOutline color="var(--color-primary-600)" />
					</button>
				</li>
			{:else}
				<li><A onclick={() => openAuthModal('sign-in')}>Sign in</A></li>
				<li><A onclick={() => openAuthModal('sign-up')}>Sign up</A></li>
			{/if}
		</ul>
	</nav>
</header>

<main class="h-full min-h-fit grow px-3 sm:px-6">
	{@render children()}
</main>

{#if showAuthModal}
	<AuthModal mode={authMode} onclose={closeAuthModal} />
{/if}

<footer class="mt-5 bg-gray-200 p-3">
	<p class="text-center text-xs text-gray-500 md:text-sm">
		© 2025 Lyla Minju Park. All rights reserved.
	</p>
</footer>

<style>
</style>
