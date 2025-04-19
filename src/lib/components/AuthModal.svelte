<script lang="ts">
	import { goto } from '$app/navigation';
	import { CloseButton } from 'flowbite-svelte';
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

	let { mode = 'sign-in', onclose } = $props<{
		mode?: 'sign-in' | 'sign-up';
		onclose: () => void;
	}>();

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
				errorMsg = error.message;
			} else if (mode === 'sign-in') {
				onclose();
			} else if (mode === 'sign-up') {
				onclose();
				goto('/my-page');
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
		<form onsubmit={handleAuth}>
			{#if mode === 'sign-up'}
				<div class="mb-4">
					<label for="username" class="mb-1 block text-gray-700">Username</label>
					<input
						id="username"
						class="w-full rounded border border-gray-300 px-3 py-2 focus:ring focus:outline-none"
						type="text"
						bind:value={username}
						required
					/>
				</div>
			{/if}
			<div class="mb-4">
				<label for="email" class="mb-1 block text-gray-700">Email</label>
				<input
					id="email"
					class="w-full rounded border border-gray-300 px-3 py-2 focus:ring focus:outline-none"
					type="email"
					bind:value={email}
					required
				/>
			</div>
			<div class="mb-4">
				<label for="password" class="mb-1 block text-gray-700">Password</label>
				<input
					id="password"
					class="w-full rounded border border-gray-300 px-3 py-2 focus:ring focus:outline-none"
					type="password"
					bind:value={password}
					required
				/>
			</div>
			{#if errorMsg}
				<div class="mb-2 text-sm text-red-600">{errorMsg}</div>
			{/if}
			<button
				class="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
				type="submit"
				disabled={isLoading}
			>
				{isLoading ? 'Loading...' : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
			</button>
		</form>
	</div>
</div>

<style>
	/* 간단한 모달 스타일 추가 */
</style>
