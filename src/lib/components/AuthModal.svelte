<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, CloseButton, Input } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { supabase } from '../supabaseClient';

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeyDown);
		}
	});

	interface Props {
		mode?: 'sign-in' | 'sign-up';
		onclose: () => void;
	}
	let { mode = 'sign-in', onclose }: Props = $props();

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let errorMsg = $state('');

	async function handleAuth() {
		isLoading = true;

		try {
			const { data, error } =
				mode === 'sign-in'
					? await supabase.auth.signInWithPassword({ email, password })
					: await supabase.auth.signUp({
							email,
							password,
							options: { data: { username } },
						});
			if (error) {
				throw error;
			} else if (mode === 'sign-in') {
				onclose();
			} else if (mode === 'sign-up') {
				onclose();
				goto(`/check-email`);
			}
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			isLoading = false;
		}
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
	onclick={onclose}
	onkeydown={handleKeyDown}
	tabindex="0"
	role="button"
>
	<div
		class="relative w-full max-w-md rounded-lg bg-white p-8 shadow-lg"
		onclick={(e) => e.stopPropagation()}
		onkeydown={() => {}}
		tabindex="0"
		role="dialog"
		aria-modal="true"
		aria-label="Authentication Modal"
	>
		<CloseButton class="absolute top-3 right-3" onclick={onclose} />
		<div class="mb-6 flex justify-center">
			<h2 class="text-xl font-bold">
				{mode === 'sign-in' ? 'Welcome Back!' : 'Create Your Account'}
			</h2>
		</div>
		<form onsubmit={handleAuth} class="space-y-4">
			{#if mode === 'sign-up'}
				<div>
					<label for="username" class="mb-1 block">Username</label>
					<Input id="username" type="text" bind:value={username} required />
				</div>
			{/if}
			<div>
				<label for="email" class="mb-1 block">Email</label>
				<Input id="email" type="email" bind:value={email} required />
			</div>
			<div>
				<label for="password" class="mb-1 block">Password</label>
				<Input id="password" type="password" bind:value={password} required />
			</div>
			{#if errorMsg}
				<div class="text-sm text-red-600">{errorMsg}</div>
			{/if}
			<Button class="mt-2 w-full" type="submit" disabled={isLoading}>
				{isLoading ? 'Loading...' : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
			</Button>
		</form>
	</div>
</div>

<style>
</style>
