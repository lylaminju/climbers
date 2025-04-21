<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import type { Post } from '$lib/schemas/post';
	import { userStore } from '$lib/stores/user';
	import { supabase, supabaseAdmin } from '$lib/supabaseClient';
	import { Button, Tooltip } from 'flowbite-svelte';
	import { ClockOutline, MapPinAltOutline, UserOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let posts = $state<(Post & { username: string | null; gym: { name: string } })[]>([]);
	let isLoading = $state(true);
	let errorMessage = $state('');

	onMount(async () => {
		try {
			const { data, error } = await supabase
				.from('post')
				.select('*, gym(name)')
				.order('created_at', { ascending: false });

			if (error) {
				throw new Error('Failed to load posts.');
			}

			// TODO: This is a temporary solution to get the username from the user metadata
			const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
			if (usersError) {
				throw new Error('Failed to load users.');
			}
			if (usersData) {
				posts =
					data?.map((post) => ({
						...post,
						username:
							usersData.users.find((user) => user.id === post.user_id)?.user_metadata?.username ??
							null,
					})) ?? [];
			}

			isLoading = false;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to load posts.';
		}
	});

	async function writePost() {
		if (!$userStore) {
			return;
		}
		goto('/find-partners/write-post');
	}
</script>

<section class="mx-auto flex w-full max-w-5xl flex-col gap-3">
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
						class="hover:border-primary-300 flex flex-col gap-1 rounded-xl border border-2 border-white bg-white p-2 text-base sm:h-45 sm:max-h-45 sm:p-3 sm:text-xl"
					>
						<h2 class="flex items-center text-lg font-bold sm:text-2xl">
							<UserOutline class="mr-1 inline" />{post.username}
						</h2>
						<p class="flex items-center">
							<MapPinAltOutline class="mr-1 inline" />{post.gym.name}
						</p>
						<p class="flex items-center">
							<ClockOutline class="mr-1 inline" />{post.available_time}
						</p>
						<p class="overflow-hidden text-ellipsis">
							{post.content}
						</p>
					</a>
				</li>
			{/each}
		</ol>
	{:else}
		<p>No posts found.</p>
	{/if}
</section>
