<script lang="ts">
	import type { Post } from '$lib/schemas/post';
	import { formatTimeToAMPM } from '$lib/utils/formatString';
	import {
		ArrowUpRightFromSquareOutline,
		ClockOutline,
		InboxOutline,
		MapPinAltOutline,
	} from 'flowbite-svelte-icons';

	type Props = {
		posts: Post[] | null;
	};
	const { posts }: Props = $props();
</script>

<div class="w-full sm:w-3xl sm:max-w-3xl">
	<h1 class="text-primary-700 mb-1 text-2xl font-bold sm:mb-3 sm:text-3xl">
		My Posts
	</h1>
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
					<div class="flex items-center gap-1">
						<MapPinAltOutline size="sm" />
						{post.gym?.name}
					</div>
					<div class="flex items-center gap-1">
						<ClockOutline size="sm" />
						<span>
							{post.user_availability?.[0]?.date}&nbsp;
							{formatTimeToAMPM(post.user_availability?.[0]?.start_time)}
							- {formatTimeToAMPM(post.user_availability?.[0]?.end_time)}
						</span>
					</div>

					<p class="h-fit max-h-18 overflow-y-auto text-gray-600 sm:h-18">
						{post.content}
					</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>
