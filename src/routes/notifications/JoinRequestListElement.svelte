<script lang="ts">
	import TimeRange from '$lib/components/TimeRange.svelte';
	import type { JoinRequestWithPost } from '$lib/schemas/joinRequest';
	import { supabase } from '$lib/supabaseClient';
	import { requestHandledTemplate } from '$lib/utils/emailTemplates';
	import {
		capitalizeWords,
		formatShortDate,
		formatTimeToAMPM,
	} from '$lib/utils/formatString';
	import { getStatusColor } from '$lib/utils/getStatusColor';
	import { sendEmail } from '$lib/utils/sendEmail';
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
		const action = type === 'accepted' ? 'accept' : 'decline';

		try {
			isUpdating = true;

			const confirmHandle = confirm(
				`Are you sure you want to ${action} this join request?`,
			);
			if (!confirmHandle) {
				return;
			}

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

			const userAvailableDatetime = `${joinRequest.date}
				&nbsp;${formatTimeToAMPM(joinRequest.start_time)}
				- ${formatTimeToAMPM(joinRequest.end_time)}
			`;
			const emailHtml = requestHandledTemplate(
				type,
				joinRequest.post.profile?.username ?? 'Post author',
				`${joinRequest.post.gym.name} (${joinRequest.post.gym.city})`,
				userAvailableDatetime,
				joinRequest.post_id,
			);
			const { statusCode, message, name } = await sendEmail(
				recipientEmail,
				`[ClimberzDay] Join Request is ${type}`,
				emailHtml,
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
			updateErrorMsg = `Failed to ${action} join request.`;
		} finally {
			isUpdating = false;
		}
	}
</script>

<li class="relative h-fit space-y-1 rounded-xl bg-white px-4 pt-3 pb-4">
	<span
		class="absolute top-3 right-3 flex flex-col items-end gap-1 text-right text-xs text-gray-500 sm:text-sm"
	>
		{#if !isPending}
			<Badge color={getStatusColor(joinRequest.status)} class="w-fit">
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
			<span class="w-52 overflow-x-scroll whitespace-nowrap sm:w-58">
				{joinRequest.guest_name} ({joinRequest.guest_email})
			</span>
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
			<TimeRange
				startDatetime={joinRequest.post.start_datetime}
				endDatetime={joinRequest.post.end_datetime}
			/>
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
