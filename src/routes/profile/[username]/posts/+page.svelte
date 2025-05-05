<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Post } from '$lib/schemas/post';
	import { userStore } from '$lib/stores/user';
	import { onMount } from 'svelte';

	import Sidebar from '../Sidebar.svelte';
	import MyPosts from './MyPosts.svelte';

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
			posts: Post[] | null;
		};
	};
	const { data }: Props = $props();
</script>

<section class="mx-auto flex w-fit flex-col gap-3 sm:flex-row">
	<Sidebar {username} activeUrl={`/profile/${username}/posts`} />

	<MyPosts posts={data?.posts} />
</section>
