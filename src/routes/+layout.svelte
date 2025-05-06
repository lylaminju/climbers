<script lang="ts">
	import { page } from '$app/state';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import type { Subscription } from '@supabase/supabase-js';
	import {
		A,
		Dropdown,
		DropdownDivider,
		DropdownItem,
		Toast,
	} from 'flowbite-svelte';
	import {
		ArrowRightToBracketOutline,
		BarsOutline,
		BellOutline,
		UserCircleOutline,
		UsersGroupOutline,
	} from 'flowbite-svelte-icons';
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';
	import AuthModal from '../lib/components/AuthModal.svelte';

	let { children } = $props();

	let listener: { subscription: Subscription } | undefined = undefined;
	let hasPendingJoinRequests = $state(false);

	onMount(async () => {
		// Initial fetch
		const { data } = await supabase.auth.getUser();
		userStore.set(data.user);
		checkPendingJoinRequests();

		// Listen for auth state changes
		const { data: listenerData } = supabase.auth.onAuthStateChange(
			(event, session) => {
				userStore.set(session?.user ?? null);
				checkPendingJoinRequests();
			},
		);

		// Store the listener
		listener = listenerData;
	});

	onDestroy(() => {
		listener?.subscription.unsubscribe();
	});

	async function checkPendingJoinRequests() {
		try {
			const { data, error } = await supabase
				.from('join_request')
				.select('join_request_id')
				.eq('status', 'pending')
				.eq('post.profile_id', $userStore?.id)
				.is('post.deleted_at', null)
				.select('*, post!inner(post_id)');

			if (error) {
				throw new Error('Failed to load join requests.');
			}

			hasPendingJoinRequests = data?.length > 0;
		} catch (error) {
			console.error(`Error checking pending join requests\n${error}`);
		}
	}

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

	let isHomepage = $derived(page.url.pathname === '/');
	let dropdownOpen = $state(false);
	let username = $derived($userStore?.user_metadata?.username);
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
	style={isHomepage ? 'background-image: url(/wall-paper.jpeg)' : ''}
	class="relative flex flex-row justify-between gap-3 pb-3
		{isHomepage
		? 'h-100 min-h-100 items-start sm:h-[50vh] sm:min-h-[50vh] sm:pt-5'
		: 'h-fit items-center sm:pt-3'} 
		bg-cover bg-top px-4 py-4 sm:px-6
	"
>
	{#if isHomepage}
		<!-- Overlay a semi-transparent black layer over the header background image for better text readability in mobile -->
		<div class="absolute inset-0 bg-black/20"></div>

		<!-- Show a gradient at the bottom of the header on the homepage for a smooth visual transition in mobile -->
		<div
			class="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-b from-transparent to-[#f0f0f0] sm:h-[0%]"
		></div>
	{/if}
	<div class="z-1 sm:flex sm:h-full sm:flex-col sm:justify-center">
		{#if isHomepage}
			<h1 class="font-fugaz text-4xl font-bold text-white sm:text-6xl">
				<a href="/" data-sveltekit-reload>ClimberzDay</a>
			</h1>
			<p class="font-fugaz text-xs text-white opacity-50 sm:text-xl">
				Explore Climbing Gyms!
			</p>
		{:else}
			<h1 class="text-primary-900 font-fugaz text-2xl font-bold sm:text-3xl">
				<a
					href="/"
					data-sveltekit-reload
					class="flex items-center gap-1 sm:gap-2"
				>
					ClimberzDay
					<img src="/logo.png" alt="ClimberzDay Logo" class="w-13 sm:w-15" />
				</a>
			</h1>
		{/if}
	</div>
	<nav class="relative z-1">
		<!-- Mobile: hamburger icon + dropdown menu -->
		<BarsOutline class="mobile-menu-trigger sm:hidden" aria-label="Open menu" />
		<Dropdown
			triggeredBy=".mobile-menu-trigger"
			class="w-fit sm:hidden"
			bind:open={dropdownOpen}
		>
			<DropdownItem>
				<A
					href="/find-partners"
					onclick={() => (dropdownOpen = false)}
					class="flex items-center gap-1 whitespace-nowrap"
				>
					<UsersGroupOutline size="sm" />
					Climbing meetups
				</A>
			</DropdownItem>
			<DropdownDivider />
			{#if $userStore}
				<DropdownItem>
					<A
						href={`/profile/${username}`}
						onclick={() => (dropdownOpen = false)}
						title="My page"
						class="flex items-center gap-1 whitespace-nowrap"
					>
						<UserCircleOutline size="sm" />
						{username}
					</A>
				</DropdownItem>
				<DropdownItem>
					<A
						href="/notifications"
						onclick={() => (dropdownOpen = false)}
						class="flex items-center gap-1 whitespace-nowrap"
					>
						<span class="relative w-fit">
							<BellOutline size="sm" color="var(--color-primary-600)" />
							{#if hasPendingJoinRequests}
								<span
									class="ring-primary-600 absolute top-1 right-1.5 block h-1 w-1 rounded-full bg-red-500 ring-1"
									style="transform: translate(40%,-40%);"
								></span>
							{/if}
						</span>
						Notifications
					</A>
				</DropdownItem>
				<DropdownDivider />
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
			<li>
				<A href="/find-partners" class="flex items-center gap-1">
					<UsersGroupOutline size="lg" />
					Climbing meetups
				</A>
			</li>
			{#if $userStore}
				<li>
					<A
						href={`/profile/${username}`}
						title="My page"
						class="flex items-center gap-1"
					>
						<UserCircleOutline size="lg" />
						{username}
					</A>
				</li>
				<li>
					<a href="/notifications" title="Notifications">
						<span class="relative">
							<BellOutline size="lg" color="var(--color-primary-600)" />
							{#if hasPendingJoinRequests}
								<span
									class="ring-primary-600 absolute top-1 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-1"
									style="transform: translate(40%,-40%);"
								></span>
							{/if}
						</span>
					</a>
				</li>
				<li>
					<button
						class="flex items-center"
						title="Sign out"
						onclick={handleSignOut}
					>
						<ArrowRightToBracketOutline
							size="lg"
							color="var(--color-primary-600)"
						/>
					</button>
				</li>
			{:else}
				<li><A onclick={() => openAuthModal('sign-in')}>Sign in</A></li>
				<li><A onclick={() => openAuthModal('sign-up')}>Sign up</A></li>
			{/if}
		</ul>
	</nav>
</header>

<main class="min-h-fit grow px-4 sm:px-6">
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
