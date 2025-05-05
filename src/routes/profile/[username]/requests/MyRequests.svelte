<script lang="ts">
	import type { JoinRequestWithPost } from '$lib/schemas/joinRequest';
	import { capitalizeWords, formatTimeToAMPM } from '$lib/utils/formatString';
	import { getStatusColor } from '$lib/utils/getStatusColor';
	import { Badge } from 'flowbite-svelte';
	import {
		ArrowUpRightFromSquareOutline,
		ClockOutline,
		InboxOutline,
		MapPinAltOutline,
		MessageDotsOutline,
		UserCircleOutline,
	} from 'flowbite-svelte-icons';

	type Props = {
		joinRequests: JoinRequestWithPost[] | null;
	};
	const { joinRequests }: Props = $props();
</script>

<div class="w-full sm:w-3xl sm:max-w-3xl">
	<h1 class="text-primary-700 mb-1 text-2xl font-bold sm:mb-3 sm:text-3xl">
		My Requests
	</h1>
	{#if !joinRequests || joinRequests.length === 0}
		<InboxOutline size="lg" class="text-gray-400" />
	{:else}
		<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{#each joinRequests as joinRequest}
				<li
					class="flex flex-col gap-1 rounded-xl bg-white p-3 text-base sm:text-lg"
				>
					<div
						class="relative mb-1 h-fit rounded-xl border border-gray-300 px-1.5 py-1 text-base text-gray-700 sm:text-lg"
					>
						<Badge
							color={getStatusColor(joinRequest.status)}
							class="absolute top-2 right-2 w-fit"
						>
							{capitalizeWords(joinRequest.status)}
						</Badge>
						<a
							href={`/find-partners/${joinRequest.post.post_id}`}
							class="absolute right-1.5 bottom-2 text-gray-400 hover:text-gray-900"
						>
							<ArrowUpRightFromSquareOutline size="sm" />
						</a>
						<div class="flex items-center gap-1">
							<UserCircleOutline size="sm" />
							{joinRequest.post.profile?.username ?? ''}
						</div>
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

					<div class="flex items-center gap-2">
						<MessageDotsOutline size="sm" />
						<p>"{joinRequest.message}"</p>
					</div>

					<div class="flex items-center gap-2">
						<ClockOutline size="sm" />
						<span class="sm:text-lg">
							{joinRequest.date}&nbsp;
							{formatTimeToAMPM(joinRequest.start_time)}
							- {formatTimeToAMPM(joinRequest.end_time)}
						</span>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
