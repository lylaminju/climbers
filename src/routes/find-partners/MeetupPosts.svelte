<script lang="ts">
	import TimeRange from '$lib/components/TimeRange.svelte';
	import type { Post } from '$lib/schemas/post';
	import { capitalizeWords } from '$lib/utils/formatString';
	import {
		ClockOutline,
		InboxOutline,
		MapPinAltOutline,
		UserCircleOutline,
		UserOutline,
	} from 'flowbite-svelte-icons';

	let { posts }: { posts: (Post & { acceptedJoinRequestsCount: number })[] } =
		$props();
</script>

{#if posts.length === 0}
	<InboxOutline size="lg" class="text-gray-400" />
{:else}
	<ul class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
		{#each posts as post}
			<li>
				<a
					href="/find-partners/{post.post_id}"
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
					<p class="flex items-center whitespace-pre-wrap">
						<ClockOutline class="mr-1 inline" />
						<TimeRange
							startDatetime={post.start_datetime}
							endDatetime={post.end_datetime}
						/>
					</p>
					<p
						class="overflow-hidden text-sm text-ellipsis whitespace-nowrap sm:mt-1 sm:text-lg"
					>
						{post.content}
					</p>
				</a>
			</li>
		{/each}
	</ul>
{/if}
