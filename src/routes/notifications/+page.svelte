<script lang="ts">
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { formatTimeToAMPM } from '$lib/utils/formatString';
	import { A } from 'flowbite-svelte';
	import {
		ArrowUpRightFromSquareOutline,
		ClockOutline,
		MapPinAltOutline,
		UserCircleOutline,
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let joinRequests = $state<null | any[]>(null);

	onMount(async () => {
		try {
			if (!$userStore?.id) {
				goto('/');
				return;
			}

			const { data, error } = await supabase
				.from('join_request')
				.select(
					'*, post!inner(*, gym(name), user_availability(date, start_time, end_time)), profile(username)',
				)
				.eq('post.profile_id', $userStore.id)
				.is('post.deleted_at', null)
				.order('created_at', { ascending: false });
			if (error) {
				throw new Error('Failed to load join requests.');
			}

			console.log(data);
			joinRequests = data;
		} catch (error) {
			console.error('Error loading join requests -', error);
		}
	});
</script>

<section class="mx-auto flex w-full max-w-3xl flex-col gap-3">
	<h1 class="text-primary-600 text-3xl font-bold">Notifications</h1>
	<h2 class="text-xl font-bold">Pending Join Requests</h2>
	{#if !joinRequests}
		<p>Error loading join requests.</p>
	{:else if joinRequests?.length > 0}
		<ul class="space-y-2 sm:space-y-3">
			{#each joinRequests as joinRequest}
				<li class="h-fit space-y-1 rounded-xl bg-white px-4 pt-3 pb-4">
					<span class="text-sm">
						{new Date(joinRequest.created_at).toLocaleString('en-CA')}
					</span>
					<div class="flex items-center gap-2">
						<UserCircleOutline />
						{#if joinRequest.request_profile_id}
							<A
								href={`/profile/${joinRequest.profile?.username}`}
								class="underline"
							>
								{joinRequest.profile?.username}
							</A>
						{:else}
							{joinRequest.guest_name} (guest)
						{/if}
					</div>
					<div class="flex items-center gap-2">
						<ClockOutline />
						{formatTimeToAMPM(joinRequest.start_time)} -
						{formatTimeToAMPM(joinRequest.end_time)}
					</div>
					<p>"{joinRequest.message}"</p>
					<div
						class="relative h-15 overflow-y-scroll rounded-xl border border-gray-300 px-1.5 py-1 text-base text-gray-700"
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
						{joinRequest.post.content}
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No join requests found.</p>
	{/if}
</section>
