<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ClimberLineIllust from '$lib/components/ClimberLineIllust.svelte';
	import GymDropdown from '$lib/components/GymDropdown.svelte';
	import Instagram from '$lib/icons/sns/Instagram.svelte';
	import WhatsApp from '$lib/icons/sns/WhatsApp.svelte';
	import XTwitter from '$lib/icons/sns/XTwitter.svelte';
	import type { Profile } from '$lib/schemas/profile';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import type { ClimbingGym } from '$lib/types/types';
	import { Button, Helper, Input, Spinner } from 'flowbite-svelte';
	import {
		CirclePlusOutline,
		LinkOutline,
		UserCircleOutline,
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let gyms = $state<ClimbingGym[]>([]);
	let profile = $state<Profile | null>(null);
	let isLoading = $state(true);
	let isUpdating = $state(false);
	/* Profile data */
	let username = $derived(profile?.username ?? '');
	let selectedGymId = $derived(profile?.gym_id ?? '');
	let boulderingGrade = $derived(profile?.bouldering_grade ?? null);
	let sportClimbingGrade = $derived(profile?.sport_climbing_grade ?? null);
	let phoneNumber = $derived(profile?.phone_number ?? null);
	let instagramUsername = $derived(profile?.instagram_link?.split('/').pop());
	let xUsername = $derived(profile?.x_link?.split('/').pop());
	let otherContactLinks = $derived(profile?.contact_links ?? null);

	// Redirect to homepage if user is not the owner of the profile after loading ends
	$effect(() => {
		const isOwnProfile =
			$userStore?.user_metadata?.username === page.params.username;

		if (!isLoading && !isOwnProfile) {
			goto('/');
		}
	});

	onMount(async () => {
		try {
			const user = await supabase.auth.getUser();

			const { data: profileData, error: profileError } = await supabase
				.from('profile')
				.select('*')
				.eq('profile_id', user.data.user?.id)
				.single();

			if (profileError) {
				throw new Error('Failed to load user profile.');
			}

			const { data: gymsData, error: gymsError } = await supabase
				.from('gym')
				.select('*')
				.order('name', { ascending: true });

			if (gymsError) {
				throw new Error('Failed to load gyms.');
			}

			profile = profileData;
			gyms = gymsData;
		} catch (error) {
			console.error(`Error loading data\n${error}`);
		} finally {
			isLoading = false;
		}
	});

	async function updateProfile(event: Event) {
		event.preventDefault();
		try {
			isUpdating = true;
			const { data, error } = await supabase
				.from('profile')
				.update({
					username: username,
					gym_id: selectedGymId === '' ? null : selectedGymId,
					bouldering_grade: boulderingGrade,
					sport_climbing_grade: sportClimbingGrade,
					phone_number: phoneNumber,
					instagram_link: instagramUsername
						? `https://instagram.com/${instagramUsername}`
						: null,
					x_link: xUsername ? `https://x.com/${xUsername}` : null,
					contact_links: otherContactLinks ? [otherContactLinks] : null,
				})
				.eq('profile_id', $userStore?.id);

			if (error) {
				throw new Error(error.message);
			}

			const { error: userError } = await supabase.auth.updateUser({
				data: {
					username: username,
				},
			});

			if (userError) {
				throw new Error(userError.message);
			}
			goto(`/profile/${username}`);
		} catch (error) {
			console.error(`Error updating profile\n${error}`);
		} finally {
			isUpdating = false;
		}
	}
</script>

<section class="mx-auto flex w-full max-w-3xl flex-col gap-3">
	<div
		class="mx-auto w-full space-y-6 rounded-xl bg-white p-4 shadow-md sm:p-6"
	>
		<div class="mb-3 flex items-center justify-between">
			<h1 class="text-primary-800 text-3xl font-bold sm:text-4xl">
				Update profile
			</h1>
			<Button
				type="submit"
				class="bg-primary-500 hover:bg-primary-600 transition"
				aria-label="Complete profile"
				onclick={updateProfile}
				disabled={isUpdating}
			>
				{isUpdating ? 'Updating...' : 'Submit'}
			</Button>
		</div>

		{#if isLoading}
			<Spinner />
		{:else}
			<div class="">
				<h2
					class="text-primary-700 mb-2 flex items-center gap-2 text-xl font-semibold sm:text-2xl"
				>
					<UserCircleOutline size="lg" />Profile
				</h2>
				<ul class="flex flex-col gap-2 text-lg sm:text-lg">
					<li><span class="font-medium">Email:</span> {$userStore?.email}</li>
					<li class="flex flex-col gap-1">
						<label for="username" class="font-medium">Username</label>
						<Input type="text" id="username" bind:value={username} />
					</li>
					<li class="flex flex-col gap-1">
						<label for="home-gym" class="font-medium">Climbing gym</label>
						<GymDropdown {gyms} bind:selectedGymId />
					</li>
					<li class="flex flex-col gap-1">
						<label for="bouldering-grade" class="font-medium">
							Bouldering grade
						</label>
						<Input
							type="text"
							id="bouldering-grade"
							bind:value={boulderingGrade}
							placeholder="e.g. 'V5', '6A+', 'V7+'"
						/>
						{#if boulderingGrade && boulderingGrade.length > 10}
							<Helper color="red"
								>Please enter a grade under 10 characters</Helper
							>
						{/if}
					</li>
					<li class="flex flex-col gap-1">
						<label for="sport-climbing-grade" class="font-medium">
							Sport climbing grade
						</label>
						<Input
							type="text"
							id="sport-climbing-grade"
							bind:value={sportClimbingGrade}
							placeholder="e.g. '5.11a'"
						/>
						{#if sportClimbingGrade && sportClimbingGrade.length > 10}
							<Helper color="red"
								>Please enter a grade under 10 characters</Helper
							>
						{/if}
					</li>
				</ul>
			</div>

			<div class="">
				<h2
					class="text-primary-700 mb-2 flex items-center gap-2 text-xl font-semibold sm:text-2xl"
				>
					<LinkOutline size="lg" />Social Links
				</h2>
				<ul class="flex flex-col gap-2 text-sm sm:text-lg">
					<li class="flex items-center gap-2">
						<WhatsApp styles="w-4 min-w-4 sm:w-5 sm:min-w-5" />
						<label class="sm:whitespace-nowrap" for="whatsapp-link">
							whatsapp.com/send/?phone=
						</label>
						<Input
							type="url"
							id="whatsapp-link"
							placeholder="12345678901"
							bind:value={phoneNumber}
							class="w-full"
						/>
					</li>
					<li class="flex items-center gap-2">
						<Instagram styles="w-4 min-w-4 sm:w-5 sm:min-w-5" />
						<label for="instagram-link"> instagram.com/ </label>
						<Input
							type="url"
							id="instagram-link"
							placeholder="username"
							bind:value={instagramUsername}
							class="w-full"
						/>
					</li>
					<li class="flex items-center gap-2">
						<XTwitter styles="w-4 min-w-4 sm:w-5 sm:min-w-5" />
						<label for="x-link"> x.com/ </label>
						<Input
							type="url"
							id="x-link"
							placeholder="username"
							bind:value={xUsername}
							class="w-full"
						/>
					</li>
					<li class="flex items-center gap-2">
						<CirclePlusOutline />
						<Input
							type="url"
							id="other-link"
							placeholder="Other link"
							bind:value={otherContactLinks}
						/>
					</li>
				</ul>
			</div>
		{/if}
	</div>
</section>
<ClimberLineIllust />
