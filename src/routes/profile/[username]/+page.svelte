<script lang="ts">
	import { goto } from '$app/navigation';
	import ClimberLineIllust from '$lib/components/ClimberLineIllust.svelte';
	import Instagram from '$lib/icons/sns/Instagram.svelte';
	import WhatsApp from '$lib/icons/sns/WhatsApp.svelte';
	import XTwitter from '$lib/icons/sns/XTwitter.svelte';
	import type { JoinRequestWithPost } from '$lib/schemas/joinRequest';
	import type { Profile } from '$lib/schemas/profile';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { Button, Tooltip } from 'flowbite-svelte';
	import {
		CirclePlusOutline,
		FilePenOutline,
		LinkOutline,
		TrashBinOutline,
		UserCircleOutline,
	} from 'flowbite-svelte-icons';
	import MyRequests from './MyRequests.svelte';

	type Props = {
		data: {
			profile: Profile | null;
			joinRequests: JoinRequestWithPost[] | null;
		};
	};
	const { data }: Props = $props();
	const profile = $derived(data?.profile);
	const joinRequests = $derived(data?.joinRequests);
	let isProfileOwner = $derived($userStore?.id === profile?.profile_id);

	async function handleDeleteProfile() {
		try {
			await supabase.auth.admin.deleteUser($userStore?.id ?? '');
			goto('/');
		} catch (error) {
			console.error('Error deleting profile:', error);
		}
	}
</script>

<section class="mx-auto flex w-full max-w-3xl flex-col gap-3">
	<div
		class="mx-auto w-full space-y-6 rounded-xl bg-white p-4 pt-3 sm:p-6 sm:pt-5"
	>
		<div class="mb-3 flex items-center justify-between">
			<h1 class="text-primary-800 text-3xl font-bold sm:text-4xl">Profile</h1>
			{#if isProfileOwner}
				<div class="flex gap-3 sm:gap-4">
					<Button
						size="xs"
						href={`/profile/${profile?.username}/update`}
						class="bg-primary-500 hover:bg-primary-600 transition"
						aria-label="Update profile"
						title="Update profile"
					>
						<FilePenOutline size="sm" color="white" />
					</Button>
					<Button
						size="xs"
						onclick={handleDeleteProfile}
						class="bg-red-100 transition hover:bg-red-200"
						aria-label="Delete profile"
						title="Delete profile"
					>
						<TrashBinOutline size="sm" color="red" />
					</Button>
				</div>
			{/if}
		</div>

		<div class="">
			<h2
				class="text-primary-700 mb-2 flex items-center gap-2 text-xl font-semibold sm:text-2xl"
			>
				<UserCircleOutline size="lg" />Info
			</h2>
			<ul class="flex flex-col gap-2 text-lg sm:text-xl">
				{#if isProfileOwner}
					<li><span class="font-medium">Email:</span> {$userStore?.email}</li>
				{/if}
				<li><span class="font-medium">Username:</span> {profile?.username}</li>
				<li>
					<span class="font-medium">Climbing gym:</span>
					{profile?.gym?.name}
				</li>
				<li>
					<span class="font-medium">Bouldering grade:</span>
					{profile?.bouldering_grade}
				</li>
				<li>
					<span class="font-medium">Sport climbing grade:</span>
					{profile?.sport_climbing_grade}
				</li>
			</ul>
		</div>

		<div class="">
			<h2
				class="text-primary-700 mb-2 flex items-center gap-2 text-xl font-semibold sm:text-2xl"
			>
				<LinkOutline size="lg" />Social Links
			</h2>
			<ul class="flex flex-col gap-2 text-base sm:text-xl">
				<li class="flex items-center gap-2">
					<WhatsApp styles="w-4 min-w-4 sm:w-5 sm:min-w-5 fill-gray-500" />
					<Tooltip>Whatsapp</Tooltip>
					<a
						href={`https://api.whatsapp.com/send/?phone=${profile?.phone_number}`}
						class="overflow-x-scroll whitespace-nowrap underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						{profile?.phone_number
							? `/send/?phone=${profile?.phone_number}`
							: null}
					</a>
				</li>
				<li class="flex items-center gap-2">
					<Instagram styles="w-4 min-w-4 sm:w-5 sm:min-w-5 text-gray-500" />
					<Tooltip>Instagram</Tooltip>
					<a
						href={profile?.instagram_link}
						class="overflow-x-scroll whitespace-nowrap underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						{profile?.instagram_link?.split('https://')[1]}
					</a>
				</li>
				<li class="flex items-center gap-2">
					<XTwitter styles="w-4 min-w-4 sm:w-5 sm:min-w-5 text-gray-500" />
					<Tooltip>X (Twitter)</Tooltip>
					<a
						href={profile?.x_link}
						class="overflow-x-scroll whitespace-nowrap underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						{profile?.x_link?.split('https://')[1]}
					</a>
				</li>
				{#if profile?.contact_links}
					<li class="flex items-center gap-2">
						<CirclePlusOutline />
						<Tooltip>Other</Tooltip>
						<a
							href={profile?.contact_links}
							class="overflow-x-scroll whitespace-nowrap underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							{profile?.contact_links?.split('https://')[1]}
						</a>
					</li>
				{/if}
			</ul>
		</div>
	</div>

	{#if isProfileOwner}
		<MyRequests {joinRequests} />
	{/if}
</section>
<ClimberLineIllust />
