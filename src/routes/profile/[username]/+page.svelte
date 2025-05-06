<script lang="ts">
	import { goto } from '$app/navigation';
	import ClimberLineIllust from '$lib/components/ClimberLineIllust.svelte';
	import GlobeIcon from '$lib/icons/GlobeIcon.svelte';
	import Instagram from '$lib/icons/sns/Instagram.svelte';
	import WhatsApp from '$lib/icons/sns/WhatsApp.svelte';
	import XTwitter from '$lib/icons/sns/XTwitter.svelte';
	import type { Profile } from '$lib/schemas/profile';
	import { userStore } from '$lib/stores/user';
	import { Button, Tooltip } from 'flowbite-svelte';
	import {
		FilePenOutline,
		LinkOutline,
		TrashBinOutline,
		UserCircleOutline,
	} from 'flowbite-svelte-icons';
	import MenuTab from './MenuTab.svelte';
	import Sidebar from './Sidebar.svelte';

	type Props = {
		data: {
			profile: Profile | null;
		};
	};
	const { data }: Props = $props();
	const profile = $derived(data?.profile);
	let isProfileOwner = $derived($userStore?.id === profile?.profile_id);

	async function handleDeleteProfile() {
		try {
			const hasConfirmed = confirm(`
Are you sure you want to delete your profile?
This action cannot be undone.

* Every post you created will remain visible.`);
			if (!hasConfirmed) {
				return;
			}

			const userId = $userStore?.id;
			if (!userId) {
				throw new Error('User ID not found');
			}

			const response = await fetch(`/profile/${profile?.username}`, {
				method: 'DELETE',
				body: JSON.stringify({ userId }),
			});

			if (response.status !== 204) {
				throw new Error('Failed to delete profile');
			}

			goto('/');
		} catch (error) {
			console.error(error instanceof Error ? error.message : 'Unknown error');
		}
	}
</script>

<section
	class="mx-auto flex w-full flex-col gap-3 sm:w-fit sm:max-w-full sm:flex-row"
>
	{#if profile && isProfileOwner}
		<Sidebar
			username={profile?.username ?? ''}
			activeUrl={`/profile/${profile?.username}`}
		/>
		<MenuTab username={profile?.username ?? ''} />
	{/if}

	{#if !profile}
		<div class="flex h-[80vh] w-full items-center justify-center">
			<p class="text-2xl font-bold">Profile not found</p>
		</div>
	{:else}
		<div
			class="mx-auto w-full space-y-6 rounded-xl bg-white p-4 pt-3 sm:w-3xl sm:max-w-full sm:p-6 sm:pt-5"
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
					<li>
						<span class="font-medium">Username:</span>
						{profile?.username}
					</li>
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
					{#if profile?.phone_number}
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
					{/if}
					{#if profile?.instagram_link}
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
					{/if}
					{#if profile?.x_link}
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
					{/if}
					{#if profile?.contact_links}
						<li class="flex items-center gap-2">
							<GlobeIcon styles="w-4 min-w-4 sm:w-5 sm:min-w-5 text-gray-500" />
							<Tooltip>Other</Tooltip>
							<a
								href={profile?.contact_links?.[0]}
								class="overflow-x-scroll whitespace-nowrap underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								{profile?.contact_links?.[0]?.split('https://')[1]}
							</a>
						</li>
					{/if}
				</ul>
			</div>
		</div>
	{/if}
</section>
<ClimberLineIllust />
