<script lang="ts">
	import { goto } from '$app/navigation';
	import ClimbersWallpaper from '$lib/components/ClimbersWallpaper.svelte';
	import GymDropdown from '$lib/components/GymDropdown.svelte';
	import TimeSelect from '$lib/components/TimeSelect.svelte';
	import { PostSchema, type Post } from '$lib/schemas/post';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import type { ClimbingGym } from '$lib/types/types';
	import { Button, Datepicker, Textarea } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let gyms = $state<ClimbingGym[]>([]);
	let selectedGymId = $state('');
	let selectedDate = $state<Date | null>(null);
	let startTime = $state('');
	let endTime = $state('');
	let content = $state('');
	let isLoading = $state(false);
	let errorMsg = $state('');

	onMount(async () => {
		try {
			const { data, error } = await supabase
				.from('gym')
				.select('*')
				.order('name');
			if (error) {
				throw new Error('Failed to load gyms.');
			}

			gyms = data ?? [];
		} catch (error) {
			errorMsg =
				error instanceof Error ? error.message : 'Failed to load gyms.';
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
				profile_id: $userStore.id,
				gym_id: selectedGymId,
				content,
			};
			const validation = PostSchema.safeParse(postData);

			if (!validation.success) {
				throw new Error('Please fill in all fields correctly.');
			}

			const { error } = await supabase.rpc('create_post_with_availability', {
				p_profile_id: $userStore.id,
				p_gym_id: selectedGymId,
				p_content: content,
				p_date: selectedDate,
				p_start_time: startTime,
				p_end_time: endTime,
			});

			if (error) {
				throw new Error('Failed to create post with availability.');
			}

			goto('/find-partners');
		} catch (error) {
			errorMsg =
				error instanceof Error
					? error.message
					: 'Something went wrong. Please try again.';
			console.error(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<section class="mx-auto flex w-full flex-col items-center">
	<ClimbersWallpaper />

	<div class="mt-3 flex w-full flex-col items-center gap-4 sm:mt-5 sm:w-lg">
		<h1 class="text-2xl font-bold sm:text-4xl">
			Let's find a climbing partner!
		</h1>

		<form onsubmit={handleSubmit} class="flex w-full flex-col gap-4">
			<div>
				<label for="gym" class="mb-1 block font-medium">Select a gym</label>
				<GymDropdown {gyms} bind:selectedGymId />
			</div>

			<div>
				<label for="available-time" class="mb-1 block font-medium">
					Available Time
				</label>
				<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Datepicker
						inputClass="min-w-70 w-full"
						bind:value={selectedDate}
						required
					/>
					<TimeSelect bind:startTime bind:endTime />
				</div>
			</div>

			<div>
				<label for="content" class="mb-1 block font-medium">Content</label>
				<Textarea
					id="content"
					class="min-h-[200px] w-full rounded border p-2"
					bind:value={content}
					placeholder="Write your message here..."
					required
				/>
			</div>

			{#if errorMsg}
				<p class="text-red-600">{errorMsg}</p>
			{/if}

			<Button
				type="submit"
				class="w-full sm:text-base"
				disabled={!$userStore || isLoading}
			>
				{isLoading ? 'Posting...' : 'Post'}
			</Button>
		</form>
	</div>
</section>
