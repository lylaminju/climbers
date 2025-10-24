<script lang="ts">
	import { goto } from '$app/navigation';
	import TimeRange from '$lib/components/TimeRange.svelte';
	import type { Post } from '$lib/schemas/post';
	import { supabase } from '$lib/supabaseClient';
	import { Button } from 'flowbite-svelte';
	import {
		ArrowUpRightFromSquareOutline,
		ClockOutline,
		InboxOutline,
		MapPinAltOutline,
		TrashBinOutline,
	} from 'flowbite-svelte-icons';

	type Props = {
		posts: Post[] | null;
	};
	const { posts }: Props = $props();

	let isDeleting = $state(false);
	let deleteErrorMsg = $state<string | null>(null);

	async function deletePost(post: Post) {
		try {
			if (!post?.post_id) {
				throw new Error('Post not found.');
			}

			isDeleting = true;

			const confirmDelete = confirm(
				'Are you sure you want to delete this post?\nThis action cannot be undone.'
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

			// refresh page
			window.location.reload();
		} catch (error) {
			deleteErrorMsg =
				error instanceof Error ? error.message : 'Unknown error occurred.';
		} finally {
			isDeleting = false;
		}
	}
</script>

{#if !posts || posts.length === 0}
	<InboxOutline size="lg" class="text-gray-400" />
{:else}
	<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
		{#each posts as post}
			<li
				class="relative flex flex-col gap-1 rounded-xl bg-white p-3 pt-2 sm:text-lg"
			>
				<a
					href={`/find-partners/${post.post_id}`}
					class="absolute right-1.5 bottom-2 text-gray-400 hover:text-gray-900"
				>
					<ArrowUpRightFromSquareOutline size="sm" class="block sm:hidden" />
					<ArrowUpRightFromSquareOutline size="md" class="hidden sm:block" />
				</a>
				{#if !post.deleted_at}
					<Button
						size="xs"
						class="absolute top-1.5 right-1.5 bg-red-200 px-2 py-1 transition hover:bg-red-300 sm:px-2.5 sm:py-1.5"
						onclick={() => deletePost(post)}
						disabled={isDeleting}
					>
						<TrashBinOutline size="sm" color="red" />
					</Button>
				{/if}
				<div class="flex items-center gap-1">
					<MapPinAltOutline size="sm" />
					{post.gym?.name}
				</div>
				<div class="flex items-center gap-1">
					<ClockOutline size="sm" />
					<TimeRange
						startDatetime={post.start_datetime}
						endDatetime={post.end_datetime}
					/>
				</div>

				<p class="h-fit max-h-18 overflow-y-auto text-gray-600 sm:h-18">
					{post.content}
				</p>
			</li>
		{/each}
	</ul>
{/if}
