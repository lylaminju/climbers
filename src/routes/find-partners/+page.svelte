<script lang="ts">
	import { goto } from '$app/navigation';
	import ClimbersWallpaper from '$lib/components/ClimbersWallpaper.svelte';
	import type { Availability } from '$lib/schemas/availability';
	import type { Post } from '$lib/schemas/post';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { Button, Spinner, Tooltip } from 'flowbite-svelte';
	import { PenOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import MeetupPosts from './MeetupPosts.svelte';

	let posts = $state<
		(Post & {
			profile: { username: string };
			gym: { name: string; city: string };
			user_availability: Availability[];
			acceptedJoinRequestsCount: number;
		})[]
	>([]);
	let isLoading = $state(true);
	let errorMessage = $state('');

	onMount(async () => {
		try {
			const { data, error } = await supabase
				.from('post')
				.select(
					`*, 
					profile(username), 
					gym(name, city), 
					user_availability(date, start_time, end_time), 
					join_requests:join_request!post_id(status)
					`,
				)
				.order('created_at', { ascending: false })
				.is('deleted_at', null);

			if (error) {
				throw new Error('Failed to load posts.');
			}

			posts = data.map((post) => ({
				...post,
				acceptedJoinRequestsCount: post.join_requests.filter(
					(request: { status: string }) => request.status === 'accepted',
				).length,
			}));
		} catch (error) {
			errorMessage = 'Error loading posts.';
		} finally {
			isLoading = false;
		}
	});

	function writePost() {
		goto('/find-partners/write-post');
	}

	const today = new Date().toISOString().split('T')[0];
	let pastPosts = $derived(
		posts.filter((post) => post.user_availability[0].date < today),
	);
	let upcomingPosts = $derived(
		posts.filter((post) => post.user_availability[0].date >= today),
	);
</script>

<section class="mx-auto flex w-full flex-col items-center">
	<ClimbersWallpaper />

	<div class="mt-3 flex w-full flex-col items-center sm:w-3xl">
		<div
			class="mb-2 flex w-full flex-row items-center justify-between gap-3 sm:mt-2 sm:mb-3"
		>
			<h1 class="text-primary-800 text-2xl font-bold sm:text-4xl">
				Find climbing partners
			</h1>

			<!-- Responsive: desktop shows text button, mobile shows icon button -->
			<Button
				onclick={writePost}
				disabled={!$userStore}
				class="hidden text-base sm:block"
			>
				Write a post
			</Button>
			<Button
				onclick={writePost}
				disabled={!$userStore}
				class="inline text-base sm:hidden"
				size="xs"
			>
				<PenOutline size="md" />
			</Button>
			{#if !$userStore}
				<Tooltip type="light">You must be signed in to write a post</Tooltip>
			{/if}
		</div>

		{#if isLoading}
			<Spinner />
		{/if}

		{#if errorMessage}
			<p class="text-red-600">{errorMessage}</p>
		{:else if posts.length > 0}
			<MeetupPosts posts={upcomingPosts} />

			<h2
				class="text-primary-700 mt-4 mb-1 w-full text-2xl font-bold sm:mb-2 sm:text-3xl"
			>
				Past meetups
			</h2>
			<MeetupPosts posts={pastPosts} />
		{:else}
			<p>No posts found.</p>
		{/if}
	</div>
</section>
