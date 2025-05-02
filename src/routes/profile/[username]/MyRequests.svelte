<script lang="ts">
	import type { JoinRequestWithPost } from '$lib/schemas/joinRequest';
	import { capitalizeWords, formatTimeToAMPM } from '$lib/utils/formatString';
	import { Badge } from 'flowbite-svelte';
	import {
		ArrowUpRightFromSquareOutline,
		ClockOutline,
		InboxOutline,
		MapPinAltOutline,
	} from 'flowbite-svelte-icons';

	type Props = {
		joinRequests: JoinRequestWithPost[] | null;
	};
	const { joinRequests }: Props = $props();
</script>

<div>
	<h1 class="text-primary-700 mb-3 text-2xl font-bold sm:text-3xl">
		My Requests
	</h1>
	{#if !joinRequests || joinRequests.length === 0}
		<InboxOutline size="lg" class="text-gray-400" />
	{:else}
		<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{#each joinRequests as joinRequest}
				<li class="flex flex-col gap-2 rounded-xl bg-white p-3 pt-2">
					<div class="flex items-center gap-1">
						<ClockOutline size="sm" />
						<span class="grow">
							{joinRequest.date}&nbsp;
							{formatTimeToAMPM(joinRequest.start_time)}
							- {formatTimeToAMPM(joinRequest.end_time)}
						</span>
						<Badge
							color={joinRequest.status === 'accepted' ? 'green' : 'yellow'}
						>
							{capitalizeWords(joinRequest.status)}
						</Badge>
					</div>

					<p>"{joinRequest.message}"</p>

					<div
						class="relative h-fit rounded-xl border border-gray-300 px-1.5 py-1 text-base text-gray-700"
					>
						<a
							href={`/find-partners/${joinRequest.post.post_id}`}
							class="absolute right-1.5 bottom-2 text-gray-400 hover:text-gray-900"
						>
							<ArrowUpRightFromSquareOutline size="sm" />
						</a>
						<div class="flex items-center gap-1">
							<MapPinAltOutline size="sm" />
							{joinRequest.post.gym?.name}
						</div>
						<div class="flex items-center gap-1">
							<ClockOutline size="sm" />
							{joinRequest.post.user_availability?.[0]?.date}&nbsp;
							{formatTimeToAMPM(
								joinRequest.post.user_availability?.[0]?.start_time,
							)}
							-
							{formatTimeToAMPM(
								joinRequest.post.user_availability?.[0]?.end_time,
							)}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
