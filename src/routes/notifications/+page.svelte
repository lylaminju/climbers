<script lang="ts">
	import { goto } from '$app/navigation';
	import ClimberLineIllust from '$lib/components/ClimberLineIllust.svelte';
	import type { JoinRequestWithPost } from '$lib/schemas/joinRequest';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { Spinner } from 'flowbite-svelte';
	import { InboxOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import JoinRequestListElement from './JoinRequestListElement.svelte';

	let isLoading = $state(true);
	let joinRequests = $state<JoinRequestWithPost[] | null>(null);
	let pendingJoinRequests = $derived(
		joinRequests?.filter((r) => r.status === 'pending'),
	);
	let handledJoinRequests = $derived(
		joinRequests?.filter(
			(r) => r.status === 'accepted' || r.status === 'declined',
		),
	);

	// Redirect to homepage if user is not logged in after loading ends
	$effect(() => {
		if (!isLoading && !$userStore?.id) {
			goto('/');
		}
	});

	onMount(async () => {
		try {
			const { data: user } = await supabase.auth.getUser();

			if (!user) {
				throw new Error('User not found');
			}

			const { data, error } = await supabase
				.from('join_request')
				.select(
					'*, post!inner(*, gym(name), user_availability(date, start_time, end_time)), profile(username)',
				)
				.eq('post.profile_id', user.user?.id)
				.is('post.deleted_at', null)
				.order('created_at', { ascending: false });

			if (error) {
				throw new Error('Failed to load join requests.');
			}

			joinRequests = data;
		} catch (error) {
			console.error('Error loading join requests -', error);
		} finally {
			isLoading = false;
		}
	});
</script>

<section class="mx-auto flex w-full max-w-3xl flex-col items-center gap-3">
	<h1 class="text-primary-600 w-full text-3xl font-bold">Notifications</h1>
	{#if isLoading}
		<Spinner />
	{:else}
		<h2 class="w-full text-xl font-bold">Pending Join Requests</h2>
		{#if !pendingJoinRequests}
			<p class="text-red-600">Error loading join requests.</p>
		{:else if pendingJoinRequests?.length > 0}
			<ul class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
				{#each pendingJoinRequests as joinRequest}
					<JoinRequestListElement {joinRequest} />
				{/each}
			</ul>
		{:else}
			<InboxOutline class="text-gray-400" />
		{/if}

		<h2 class="w-full text-xl font-bold">Handled Join Requests</h2>
		{#if handledJoinRequests?.length === 0}
			<InboxOutline class="text-gray-400" />
		{:else if handledJoinRequests && handledJoinRequests?.length > 0}
			<ul class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
				{#each handledJoinRequests as joinRequest}
					<JoinRequestListElement {joinRequest} />
				{/each}
			</ul>
		{/if}
	{/if}
</section>
<ClimberLineIllust />
