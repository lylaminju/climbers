<script lang="ts">
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { requestToJoinTemplate } from '$lib/utils/emailTemplates';
	import { formatTimeToAMPM } from '$lib/utils/formatString';
	import { sendEmail } from '$lib/utils/sendEmail';
	import { Button } from 'flowbite-svelte';
	import {
		ClockOutline,
		EnvelopeOutline,
		MessageDotsOutline,
		UserCircleOutline,
	} from 'flowbite-svelte-icons';
	import RequestSent from './RequestSent.svelte';

	const { formData } = $props();

	let isSending = $state(false);
	let errorMsg = $state('');
	let userName = $derived($userStore?.user_metadata?.username || '');
	let userEmail = $derived($userStore?.email || '');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		isSending = true;
		errorMsg = '';

		const { data, error: insertError } = await supabase
			.from('join_request')
			.insert({
				post_id: formData?.postId,
				request_profile_id: formData?.requestProfileId,
				guest_name: formData?.guestName,
				guest_email: formData?.guestEmail,
				date: formData?.date,
				start_time: formData?.startTime,
				end_time: formData?.endTime,
				message: formData?.message,
			})
			.select();

		const joinRequestId = data?.[0]?.join_request_id;

		try {
			if (insertError) {
				throw new Error('Failed to insert join_request');
			}

			const posterEmail = formData?.posterEmail;

			if (!posterEmail) {
				throw new Error('Failed to get a poster email');
			}

			const emailHtml = requestToJoinTemplate(
				formData?.guestName ?? userName,
				formData?.message,
				formData?.postId,
			);
			const { statusCode, message, name } = await sendEmail(
				posterEmail,
				'[ClimberzDay] Request to Join',
				emailHtml,
			);

			if (statusCode !== undefined) {
				throw new Error(`${statusCode} ${name}: ${message}`);
			}

			showConfirmation = false;
		} catch (error) {
			console.error(error);
			errorMsg = 'Failed to send a request';

			// rollback join_request insertion if it was created
			if (joinRequestId) {
				await supabase
					.from('join_request')
					.delete()
					.eq('join_request_id', joinRequestId);
			}
		} finally {
			isSending = false;
		}
	}

	let showConfirmation = $state(true);
</script>

{#if showConfirmation}
	<form onsubmit={handleSubmit} class="flex flex-col gap-3">
		<h2 class="text-xl font-bold sm:text-2xl">Confirm your request</h2>
		<ul class="flex flex-col gap-2 text-lg sm:text-xl">
			<li class="flex items-center gap-2">
				<UserCircleOutline />
				<span class="whitespace-nowrap">{formData?.guestName ?? userName}</span>
			</li>
			<li class="flex items-center gap-2">
				<EnvelopeOutline />
				<span class="whitespace-nowrap"
					>{formData?.guestEmail ?? userEmail}</span
				>
			</li>
			<li class="flex items-center gap-2">
				<ClockOutline />
				<span class="whitespace-nowrap">{formData?.date}&nbsp;</span>
				<span class="whitespace-nowrap">
					{formatTimeToAMPM(formData?.startTime)} -
					{formatTimeToAMPM(formData?.endTime)}
				</span>
			</li>
			<li class="flex items-center gap-2">
				<MessageDotsOutline />
				<span class="w-full max-w-full min-w-0 break-words whitespace-pre-wrap">
					{formData?.message}
				</span>
			</li>
		</ul>
		<Button class="mt-3 w-full" type="submit" disabled={isSending}>
			{isSending ? 'Sending request...' : 'Confirm to Join'}
		</Button>

		{#if errorMsg}
			<p class="text-red-600">{errorMsg}</p>
		{/if}
	</form>
{:else}
	<RequestSent
		email={formData?.guestEmail ?? userEmail}
		postId={formData?.postId}
	/>
{/if}
