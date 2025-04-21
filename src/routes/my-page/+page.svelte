<script lang="ts">
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { Button } from 'flowbite-svelte';
	import { LinkOutline, UserCircleOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!$userStore) {
			goto('/');
		}
	});

	async function handleDeleteProfile() {
		try {
			await supabase.auth.admin.deleteUser($userStore?.id ?? '');
			goto('/');
		} catch (error) {
			console.error('Error deleting profile:', error);
		}
	}
</script>

<section class="mx-auto flex w-full max-w-5xl flex-col gap-3">
	<div class="mx-auto w-full space-y-6 rounded-xl bg-white p-6 shadow-md">
		<h1 class="text-primary-800 mb-3 text-3xl font-bold sm:text-4xl">My Page</h1>

		<div class="">
			<h2 class="text-primary-700 mb-2 flex items-center gap-2 text-xl font-semibold sm:text-2xl">
				<UserCircleOutline size="lg" />Profile
			</h2>
			<ul class="flex flex-col gap-2 text-lg sm:text-xl">
				<li><span class="font-medium">Username:</span> {$userStore?.user_metadata?.username}</li>
				<li><span class="font-medium">Email:</span> {$userStore?.email}</li>
				<li>
					<span class="font-medium">Climbing gym:</span>
					{$userStore?.user_metadata?.home_gym_id}
				</li>
				<li>
					<span class="font-medium">Bouldering grade:</span>
					{$userStore?.user_metadata?.bouldering_grade}
				</li>
				<li>
					<span class="font-medium">Sport climbing grade:</span>
					{$userStore?.user_metadata?.sport_climbing_grade}
				</li>
			</ul>
		</div>

		<div class="">
			<h2 class="text-primary-700 mb-2 flex items-center gap-2 text-xl font-semibold sm:text-2xl">
				<LinkOutline size="lg" />Contact Links
			</h2>
			<ul class="flex flex-col gap-2 text-lg sm:text-xl">
				<li class="flex items-center gap-2">
					<!-- Whatsapp icon -->
					<svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"
						><path
							d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.98L0 24l6.26-1.64A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.2-3.48-8.52zM12 22c-1.97 0-3.89-.52-5.56-1.5l-.4-.24-3.72.97.99-3.62-.26-.42C2.55 15.89 2 13.98 2 12 2 6.48 6.48 2 12 2c2.13 0 4.17.66 5.88 1.88A9.93 9.93 0 0122 12c0 5.52-4.48 10-10 10zm5.2-7.78c-.28-.14-1.67-.82-1.93-.91-.26-.1-.45-.14-.64.14-.19.28-.74.91-.91 1.1-.17.19-.34.21-.62.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.19-.28.28-.47.09-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.16-.01-.36-.01-.56-.01s-.5.07-.76.36c-.26.28-1.01.98-1.01 2.39 0 1.41 1.03 2.77 1.18 2.97.14.19 2.03 3.1 4.92 4.23.69.29 1.23.46 1.65.59.69.22 1.31.19 1.81.12.55-.08 1.67-.68 1.9-1.34.24-.67.24-1.25.17-1.34-.07-.09-.25-.14-.53-.28z"
						/></svg
					>
					<a
						href={$userStore?.user_metadata?.whatsapp_link}
						class="hover:underline"
						target="_blank"
						rel="noopener noreferrer">Whatsapp</a
					>
				</li>
				<li class="flex items-center gap-2">
					<!-- Instagram icon -->
					<svg class="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"
						><path
							d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm5.5 1.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z"
						/></svg
					>
					<a
						href={$userStore?.user_metadata?.instagram_link}
						class="hover:underline"
						target="_blank"
						rel="noopener noreferrer">Instagram</a
					>
				</li>
				<li class="flex items-center gap-2">
					<!-- X (Twitter) icon -->
					<svg class="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"
						><path
							d="M22.162 2H16.69l-4.69 6.57L7.31 2H1.838l7.373 10.34L1.5 22h5.47l4.66-6.53L16.69 22h5.47l-7.37-10.34L22.162 2z"
						/></svg
					>
					<a
						href={$userStore?.user_metadata?.x_link}
						class="hover:underline"
						target="_blank"
						rel="noopener noreferrer">X</a
					>
				</li>
				{#if $userStore?.user_metadata?.contact_links?.length}
					<li class="flex items-center gap-2">
						<!-- Other icon -->
						<svg
							class="h-5 w-5 text-gray-500"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg
						>
						<span>Other: {$userStore?.user_metadata?.contact_links?.join(', ')}</span>
					</li>
				{/if}
			</ul>
		</div>

		<div class="flex gap-4 pt-4 text-base sm:text-xl">
			<Button class="bg-primary-600 hover:bg-primary-700 flex-1 text-white transition">
				Update profile
			</Button>
			<Button
				onclick={handleDeleteProfile}
				class="flex-1 bg-red-100 text-red-600 transition hover:bg-red-200"
			>
				Delete profile
			</Button>
		</div>
	</div>
</section>
