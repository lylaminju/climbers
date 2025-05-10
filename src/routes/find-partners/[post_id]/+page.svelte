<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import TimeRange from '$lib/components/TimeRange.svelte';
	import MapIcon from '$lib/icons/MapIcon.svelte';
	import type { JoinRequestWithPost } from '$lib/schemas/joinRequest';
	import type { Post } from '$lib/schemas/post';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { capitalizeWords } from '$lib/utils/formatString';
	import { Button, Modal, Toast } from 'flowbite-svelte';
	import {
		ClockOutline,
		TrashBinOutline,
		UserCircleOutline,
	} from 'flowbite-svelte-icons';
	import Attendees from './Attendees.svelte';
	import RequestForm from './RequestForm.svelte';

	type Props = {
		data: {
			post: Post | null;
		};
	};
	const { data }: Props = $props();
	const post = $derived(data?.post);
	let isDeleting = $state(false);
	let deleteErrorMsg = $state<string | null>(null);
	let showModal = $state(false);
	const isPostAuthor = $derived($userStore?.id === post?.profile_id);
	const isPastDate = $derived(
		(post?.start_datetime ?? '') < new Date().toISOString().split('T')[0],
	);
	const hasSentRequest = $derived(
		post?.join_request?.some((r) => r.request_profile_id === $userStore?.id) ??
			false,
	);

	async function deletePost() {
		try {
			if (!post?.post_id) {
				throw new Error('Post not found.');
			}
			// Only allow the poster to delete
			if (!isPostAuthor) {
				throw new Error('You are not authorized to delete this post.');
			}
			isDeleting = true;

			const confirmDelete = confirm(
				'Are you sure you want to delete this post?\nThis action cannot be undone.',
			);
			if (!confirmDelete) {
				return;
			}

			const { error } = await supabase
				.from('post')
				.update({ deleted_at: new Date() })
				.eq('post_id', post.post_id);
			if (error) {
				throw new Error('Failed to delete post.');
			}
			goto('/find-partners');
		} catch (error) {
			deleteErrorMsg =
				error instanceof Error ? error.message : 'Unknown error occurred.';
		} finally {
			isDeleting = false;
		}
	}
</script>

<section class="mx-auto flex h-full max-w-3xl flex-col justify-between">
	{#if post}
		<div
			class=" flex flex-col gap-1 rounded-xl border border-2 border-white bg-white p-4 text-xl sm:p-6 sm:text-2xl"
		>
			{#if deleteErrorMsg}
				<Toast color="red" class="absolute top-0 right-0 z-2">
					{deleteErrorMsg}
				</Toast>
			{/if}

			<div
				style="background-image: url(/gym-preview/{post.gym.image_url})"
				class="gym-title relative mb-1 h-[180px] w-full max-w-full rounded-xl bg-[#ccc] bg-cover bg-center p-2 text-center text-white sm:h-[280px]"
			>
				<a
					href={post.gym.map_url}
					target="_blank"
					class="absolute top-2 right-2 rounded-full bg-[rgba(0,0,0,0.3)] p-1 hover:bg-[rgba(0,0,0,0.5)]"
				>
					<MapIcon styles="w-5 sm:w-6 stroke-white stroke-2" />
				</a>
				<p
					class="overflow-x-scroll text-2xl font-bold whitespace-nowrap sm:text-3xl"
				>
					{post.gym.name}
				</p>
				<p class="overflow-x-scroll text-lg whitespace-nowrap sm:text-xl">
					{capitalizeWords(post.gym.city || '')}
				</p>
			</div>

			<h1 class="relative flex items-center text-xl font-bold sm:text-2xl">
				<UserCircleOutline class="mr-2" />
				<a
					href={`${base}/profile/${post?.profile?.username}`}
					class="overflow-x-scroll underline"
				>
					{post?.profile?.username}
				</a>
				<!-- Delete Button: Only show if current user is the poster -->
				{#if isPostAuthor}
					<Button
						size="xs"
						class="absolute top-0 right-0 bg-red-200 px-2 py-1 transition hover:bg-red-300 sm:px-2.5 sm:py-1.5"
						onclick={deletePost}
						disabled={isDeleting}
					>
						{#if isDeleting}
							Deleting...
						{:else}
							<TrashBinOutline size="sm" color="red" />
						{/if}
					</Button>
				{/if}
			</h1>

			<div class="flex items-center gap-2">
				<ClockOutline />
				<TimeRange
					startDatetime={post.start_datetime}
					endDatetime={post.end_datetime}
				/>
			</div>
			<p class="mt-3 whitespace-pre-wrap">{post.content}</p>

			{#if !isPostAuthor}
				<Button
					class="mt-4 w-full sm:text-base"
					onclick={() => (showModal = true)}
					disabled={isPastDate || hasSentRequest}
				>
					Request to Join
				</Button>
			{/if}
		</div>

		<Attendees
			joinRequests={(post.join_request as JoinRequestWithPost[] | null)?.filter(
				(r) => r.status === 'accepted',
			)}
		/>

		{#if showModal}
			<Modal size="xs" bind:open={showModal} outsideclose>
				<RequestForm
					postId={post.post_id}
					posterEmail={post.profile.email}
					start_datetime={post.start_datetime}
					end_datetime={post.end_datetime}
				/>
			</Modal>
		{/if}
	{:else}
		<p>Post not found.</p>
	{/if}
	<img
		class="w-full max-w-3xl opacity-70"
		src="/decor/climber-line-illust-woman.png"
		alt="Climber illustration"
	/>
</section>

<style>
	.gym-title {
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-shadow: 1px 1px 4px rgba(0, 0, 0, 1);
	}
</style>
