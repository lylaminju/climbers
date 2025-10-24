<script lang="ts">
	import type { Post } from '$lib/schemas/post';
	import PostComponent from './PostComponent.svelte';

	type Props = {
		posts: Post[] | null;
	};
	const { posts }: Props = $props();
	const existingPosts = $derived(
		posts?.filter((post) => !post.deleted_at) ?? []
	);
	const deletedPosts = $derived(posts?.filter((post) => post.deleted_at) ?? []);
</script>

<div class="w-full sm:w-3xl sm:max-w-3xl">
	<h1 class="text-primary-700 mb-1 text-2xl font-bold sm:mb-3 sm:text-3xl">
		My Posts
	</h1>
	<PostComponent posts={existingPosts} />

	<h2 class="text-primary-700 my-1 text-xl font-bold sm:my-3 sm:text-2xl">
		Deleted Posts
	</h2>
	<PostComponent posts={deletedPosts} />
</div>
