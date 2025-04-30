<script lang="ts">
	import type { JoinRequestWithPost } from '$lib/schemas/joinRequest';
	import { formatTimeToAMPM } from '$lib/utils/formatString';
	import { ClockOutline, UserCircleOutline } from 'flowbite-svelte-icons';

	type Props = {
		joinRequests: JoinRequestWithPost[] | undefined;
	};
	const { joinRequests }: Props = $props();
</script>

<div class="mt-4">
	<h2 class="mb-1 text-xl font-bold">Attendees</h2>
	{#if !joinRequests || joinRequests.length === 0}
		<p class="text-gray-500">No attendees found.</p>
	{:else}
		<ul class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each joinRequests as joinRequest}
				<li class="rounded-lg bg-white p-2 text-base sm:p-3 sm:text-lg">
					<div class="flex items-center gap-1">
						<UserCircleOutline />
						<span class="overflow-x-scroll whitespace-nowrap">
							{joinRequest.profile?.username ??
								`${joinRequest.guest_name} (guest)`}
						</span>
					</div>
					<div class="flex items-center gap-1 text-sm sm:text-base">
						<ClockOutline />
						<span class="overflow-x-scroll whitespace-nowrap">
							{formatTimeToAMPM(joinRequest.start_time)} -
							{formatTimeToAMPM(joinRequest.end_time)}
						</span>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
