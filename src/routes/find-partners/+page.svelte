<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import ClimbersWallpaper from '$lib/components/ClimbersWallpaper.svelte';
	import type { Availability } from '$lib/schemas/availability';
	import type { Post } from '$lib/schemas/post';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { capitalizeWords, formatTimeToAMPM } from '$lib/utils/formatString';
	import { Button, Spinner, Tooltip } from 'flowbite-svelte';
	import {
		ClockOutline,
		MapPinAltOutline,
		PenOutline,
		UserCircleOutline,
		UserOutline,
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

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
</script>

<section class="mx-auto flex w-full flex-col items-center gap-3">
	<ClimbersWallpaper />

	<div
		class="flex w-full flex-row items-center justify-between gap-3 sm:mt-2 sm:w-3xl"
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
		<ol class="grid w-full grid-cols-1 gap-3 sm:w-3xl sm:grid-cols-2">
			{#each posts as post}
				<li>
					<a
						href="{base}/find-partners/{post.post_id}"
						class="hover:bg-primary-50 relative flex h-fit flex-col gap-1 rounded-xl bg-white p-2 text-base sm:p-3 sm:text-xl"
					>
						<span
							class="absolute top-2 right-3 flex items-center gap-0.5 sm:top-3"
						>
							<UserOutline size="sm" />
							<span class="text-sm">{post.acceptedJoinRequestsCount}</span>
						</span>
						<h2 class="flex items-center text-lg font-bold sm:text-xl">
							<UserCircleOutline class="mr-1 inline" />{post.profile.username}
						</h2>
						<p class="flex items-center">
							<MapPinAltOutline class="mr-1 inline" />{post.gym.name}
						</p>
						<p class="flex items-center">
							<MapPinAltOutline class="mr-1 inline" />
							{capitalizeWords(post.gym.city)}
						</p>
						<p class="flex items-center">
							<ClockOutline class="mr-1 inline" />
							{post.user_availability[0]?.date}
							{formatTimeToAMPM(post.user_availability[0]?.start_time)}
							- {formatTimeToAMPM(post.user_availability[0]?.end_time)}
						</p>
						<p
							class="overflow-hidden text-sm text-ellipsis whitespace-nowrap sm:mt-1 sm:text-lg"
						>
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
