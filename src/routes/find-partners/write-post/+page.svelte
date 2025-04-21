<script lang="ts">
	import { goto } from '$app/navigation';
	import { PostSchema, type Post } from '$lib/schemas/post';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import type { ClimbingGym } from '$lib/types/types';
	import { Button, Dropdown, DropdownItem, Search } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let gyms: ClimbingGym[] = $state([]);
	let selectedGymId: string = $state('');
	let availableTime: string = $state('');
	let content: string = $state('');
	let isLoading = $state(false);
	let errorMsg = $state('');

	let searchTerm = $state('');
	const gymSearchList = $derived(gyms);
	let filteredGyms = $derived(
		gymSearchList.filter((gym) => gym.name.toLowerCase().includes(searchTerm.toLowerCase())),
	);

	onMount(async () => {
		try {
			if (!$userStore) {
				goto('/');
				return;
			}

			const { data, error } = await supabase.from('gym').select('*').order('name');
			if (error) {
				throw new Error('Failed to load gyms.');
			}

			gyms = data ?? [];
		} catch (error) {
			errorMsg = error instanceof Error ? error.message : 'Failed to load gyms.';
		}
	});

	async function handleSubmit() {
		try {
			if (!$userStore) {
				throw new Error('You must be signed in to write a post.');
			}
			if (!selectedGymId) {
				throw new Error('Please select a climbing gym.');
			}

			isLoading = true;

			const postData: Post = {
				user_id: $userStore.id,
				gym_id: selectedGymId,
				available_time: availableTime,
				content,
			};

			const validation = PostSchema.safeParse(postData);

			if (!validation.success) {
				throw new Error('Please fill in all fields correctly.');
			}

			const { error } = await supabase.from('post').insert([postData]);

			if (error) {
				throw new Error(error.message);
			}

			goto('/find-partners');
		} catch (error) {
			errorMsg = error instanceof Error ? error.message : 'Unknown error';
		} finally {
			isLoading = false;
		}
	}
</script>

<section class="mx-auto mt-8 flex max-w-lg flex-col gap-4">
	<h1 class="text-2xl font-bold">Write a post</h1>

	<form onsubmit={handleSubmit} class="flex flex-col gap-4">
		<div>
			<label for="gym" class="mb-1 block font-medium">Select a gym</label>
			<Button class="dropdown-btn">
				{selectedGymId ? gyms.find((gym) => gym.gym_id === selectedGymId)?.name : 'Climbing gyms'}
				<ChevronDownOutline class="ms-1 h-6 w-6 text-white sm:ms-2 dark:text-white" />
			</Button>
			<Dropdown class="h-44 overflow-y-auto px-3 pb-3 text-sm sm:h-50">
				<div slot="header" class="p-3">
					<Search size="md" bind:value={searchTerm} />
				</div>
				{#each filteredGyms as gym}
					<DropdownItem
						onclick={() => {
							selectedGymId = gym.gym_id;
						}}
						class="flex flex-row justify-between gap-2"
					>
						<span>{gym.name}</span>
						<span class="text-gray-500">{gym.city}</span>
					</DropdownItem>
				{/each}
			</Dropdown>
		</div>

		<div>
			<label for="available-time" class="mb-1 block font-medium">Available Time</label>
			<input
				id="available-time"
				type="text"
				class="w-full rounded border p-2"
				bind:value={availableTime}
				placeholder="e.g. Monday 10:00 - 12:00"
				required
			/>
		</div>

		<div>
			<label for="content" class="mb-1 block font-medium">Content</label>
			<textarea
				id="content"
				class="min-h-[100px] w-full rounded border p-2"
				bind:value={content}
				placeholder="Write your message here..."
				required
			></textarea>
		</div>

		{#if errorMsg}
			<p class="text-red-600">{errorMsg}</p>
		{/if}

		<Button type="submit" class="w-full" disabled={isLoading}>
			{isLoading ? 'Posting...' : 'Post'}
		</Button>
	</form>
</section>
