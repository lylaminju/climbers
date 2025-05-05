<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { JoinRequestWithPost } from '$lib/schemas/joinRequest';
	import { userStore } from '$lib/stores/user';
	import { onMount } from 'svelte';

	import Sidebar from '../Sidebar.svelte';
	import MyRequests from './MyRequests.svelte';

	let username = $derived(page.params.username);
	let isProfileOwner = $derived(
		$userStore?.user_metadata?.username === username,
	);

	onMount(() => {
		if (!isProfileOwner) {
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
	<Sidebar {username} activeUrl={`/profile/${username}/requests`} />

	<MyRequests joinRequests={data?.joinRequests} />
</section>
