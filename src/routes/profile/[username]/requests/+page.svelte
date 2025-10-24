<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { JoinRequestWithPost } from '$lib/schemas/joinRequest';
	import { userStore } from '$lib/stores/user';

	import Sidebar from '../Sidebar.svelte';
	import MyRequests from './MyRequests.svelte';
	import MenuTab from '../MenuTab.svelte';
	import { Spinner } from 'flowbite-svelte';

	let username = $derived(page.params.username);
	let isProfileOwner = $derived(
		$userStore?.user_metadata?.username === username
	);
	let isLoading = $derived($userStore === null);

	// Redirect if not profile owner (only after userStore is loaded)
	$effect(() => {
		if ($userStore !== null && !isProfileOwner) {
			goto(`/profile/${username}`);
		}
	});

	type Props = {
		data: {
			joinRequests: JoinRequestWithPost[] | null;
		};
	};
	const { data }: Props = $props();
</script>

<section class="mx-auto flex w-fit flex-col gap-3 sm:flex-row">
	{#if isLoading}
		<!-- Loading state: prevent flash of unauthorized content -->
		<div class="flex h-200 items-center justify-center">
			<Spinner size="12" />
		</div>
	{:else if isProfileOwner}
		<Sidebar {username} activeUrl={`/profile/${username}/requests`} />
		<MenuTab {username} />

		<MyRequests joinRequests={data?.joinRequests} />
	{/if}
</section>
