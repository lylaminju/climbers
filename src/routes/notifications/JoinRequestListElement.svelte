<script lang="ts">
	import type { JoinRequestWithPost } from '$lib/schemas/joinRequest';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { requestHandledTemplate } from '$lib/utils/emailTemplates';
	import {
		capitalizeWords,
		formatShortDate,
		formatTimeToAMPM,
	} from '$lib/utils/formatString';
	import { A, Badge, Button } from 'flowbite-svelte';
	import {
		ArrowUpRightFromSquareOutline,
		ClockOutline,
		MapPinAltOutline,
		UserCircleOutline,
	} from 'flowbite-svelte-icons';

	let { joinRequest }: { joinRequest: JoinRequestWithPost } = $props();
	const isPending = $derived(joinRequest.status === 'pending');
	let isUpdating = $state(false);
	let updateErrorMsg = $state('');

	async function handleRequest(
		type: 'accepted' | 'declined',
		joinRequestId: string,
	) {
		try {
			isUpdating = true;

			const { error } = await supabase
				.from('join_request')
				.update({ status: type })
				.eq('join_request_id', joinRequestId);

			if (error) {
				throw error;
			}

			// send email
			const recipientEmail = joinRequest.request_profile_id
				? joinRequest.profile?.email
				: joinRequest.guest_email;

			if (!recipientEmail) {
				throw new Error('Failed to get a recipient email');
			}

			const { statusCode, message, name } = await sendEmail(
				recipientEmail,
				type,
				'Thank you for joining!', // TODO: Get message from user
				joinRequest.post_id,
			);

			if (statusCode !== undefined) {
				throw new Error(`${statusCode} ${name}: ${message}`);
			}

			window.location.href = '/notifications';
		} catch (error) {
			// rollback if failed
			await supabase
				.from('join_request')
				.update({ status: 'pending' })
				.eq('join_request_id', joinRequestId);

			console.error('Error updating join request status -', error);
			const action = type === 'accepted' ? 'accept' : 'decline';
			updateErrorMsg = `Failed to ${action} join request.`;
		} finally {
			isUpdating = false;
		}
	}

	async function sendEmail(
		recipientEmail: string,
		type: 'accepted' | 'declined',
		message: string,
		postId: string,
	) {
		try {
			const requestBody = JSON.stringify({
				email: recipientEmail,
				subject: `Join Request is ${type}`,
				html: requestHandledTemplate(
					type,
					$userStore?.user_metadata?.username ?? 'Post author',
					message,
					postId,
				),
			});
			const response = await fetch('/email', {
				method: 'POST',
				body: requestBody,
			});
			return await response.json();
		} catch (error) {
			throw new Error('Failed preparing email');
		}
	}
</script>

<li class="relative h-fit space-y-1 rounded-xl bg-white px-4 pt-3 pb-4">
	<span
		class="absolute top-3 right-3 flex flex-col gap-1 text-right text-xs text-gray-500 sm:text-sm"
	>
		{#if !isPending}
			<Badge color={joinRequest.status === 'accepted' ? 'green' : 'yellow'}>
				{capitalizeWords(joinRequest.status)}
			</Badge>
		{/if}
		{formatShortDate(joinRequest.created_at)}
		{new Date(joinRequest.created_at).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		})}
	</span>
	<div class="flex items-center gap-2">
		<UserCircleOutline />
		{#if joinRequest.request_profile_id}
			<A href={`/profile/${joinRequest.profile?.username}`} class="underline">
				{joinRequest.profile?.username}
			</A>
		{:else}
			{joinRequest.guest_name} (guest)
		{/if}
	</div>
	<div class="flex items-center gap-2">
		<ClockOutline />
		{formatTimeToAMPM(joinRequest.start_time)} -
		{formatTimeToAMPM(joinRequest.end_time)}
	</div>
	<p>"{joinRequest.message}"</p>
	<div
		class="relative mt-2 h-fit rounded-xl border border-gray-300 px-1.5 py-1 text-base text-gray-700"
	>
		<a
			href={`/find-partners/${joinRequest.post.post_id}`}
			class="absolute right-1.5 bottom-2 text-gray-400 hover:text-gray-900"
		>
			<ArrowUpRightFromSquareOutline size="sm" />
		</a>
		<div class="flex items-center gap-1">
			<MapPinAltOutline size="sm" />
			{joinRequest.post.gym?.name}
		</div>
		<div class="flex items-center gap-1">
			<ClockOutline size="sm" />
			{joinRequest.post.user_availability?.[0]?.date}&nbsp;
			{formatTimeToAMPM(joinRequest.post.user_availability?.[0]?.start_time)}
			-
			{formatTimeToAMPM(joinRequest.post.user_availability?.[0]?.end_time)}
		</div>
	</div>
	{#if isPending}
		<div class="mt-3 flex w-full gap-2">
			<Button
				class="w-full"
				size="sm"
				disabled={isUpdating}
				onclick={() => handleRequest('accepted', joinRequest.join_request_id)}
			>
				Accept
			</Button>
			<Button
				class="w-full"
				size="sm"
				disabled={isUpdating}
				onclick={() => handleRequest('declined', joinRequest.join_request_id)}
			>
				Decline
			</Button>
		</div>
		{#if updateErrorMsg}
			<p class="text-red-600">{updateErrorMsg}</p>
		{/if}
	{/if}
</li>
