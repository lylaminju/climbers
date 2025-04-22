<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import type { Availability } from '$lib/schemas/availability';
	import type { Post } from '$lib/schemas/post';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { capitalizeWords, formatTimeToAMPM } from '$lib/utils/formatString';
	import { Button, Tooltip } from 'flowbite-svelte';
	import { ClockOutline, MapPinAltOutline, UserOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let posts = $state<
		(Post & {
			profile: { username: string };
			gym: { name: string; city: string };
			user_availability: Availability[];
		})[]
	>([]);
	let isLoading = $state(true);
	let errorMessage = $state('');

	onMount(async () => {
		try {
			const { data, error } = await supabase
				.from('post')
				.select(
					'*, profile(username), gym(name, city), user_availability(date, start_time, end_time)',
				)
				.order('created_at', { ascending: false });

			if (error) {
				throw new Error('Failed to load posts.');
			}

			posts = data;
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Unable to load posts. Please try again.';
		} finally {
			isLoading = false;
		}
	});

	async function writePost() {
		if (!$userStore) {
			return;
		}
		goto('/find-partners/write-post');
	}
</script>

<section class="mx-auto flex w-full max-w-3xl flex-col gap-3">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-primary-800 text-3xl font-bold sm:text-4xl">Find climbing partners</h1>

		<Button onclick={writePost} disabled={!$userStore} class="text-base">Write a post</Button>
		{#if !$userStore}
			<Tooltip type="light">You must be signed in to write a post</Tooltip>
		{/if}
	</div>

	{#if errorMessage}
		<p class="text-red-600">{errorMessage}</p>
	{/if}

	{#if isLoading}
		<p>Loading...</p>
	{/if}

	{#if posts.length > 0}
		<ol class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{#each posts as post}
				<li>
					<a
						href="{base}/find-partners/{post.post_id}"
						class="hover:border-primary-300 flex flex-col gap-1 rounded-xl border border-2 border-white bg-white p-2 text-base sm:h-54 sm:max-h-54 sm:p-3 sm:text-xl"
					>
						<h2 class="flex items-center text-lg font-bold sm:text-2xl">
							<UserOutline class="mr-1 inline" />{post.profile.username}
						</h2>
						<p class="flex items-center">
							<MapPinAltOutline class="mr-1 inline" />{post.gym.name}
						</p>
						<p class="flex items-center">
							<MapPinAltOutline class="mr-1 inline" />{capitalizeWords(post.gym.city)}
						</p>
						<p class="flex items-center">
							<ClockOutline class="mr-1 inline" />
							{post.user_availability[0]?.date}
							{formatTimeToAMPM(post.user_availability[0]?.start_time)}
							- {formatTimeToAMPM(post.user_availability[0]?.end_time)}
						</p>
						<p class="overflow-hidden text-ellipsis whitespace-pre">
							{post.content}
						</p>
					</a>
				</li>
			{/each}
		</ol>
	{:else if !isLoading}
		<p>No posts found.</p>
	{/if}
</section>
