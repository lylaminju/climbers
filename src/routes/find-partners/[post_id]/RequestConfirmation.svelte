<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { requestToJoinTemplate } from '$lib/utils/emailTemplates';
	import { formatTimeToAMPM } from '$lib/utils/formatString';
	import { sendEmail } from '$lib/utils/sendEmail';
	import { Button } from 'flowbite-svelte';

	const { formData } = $props();

	let isSending = $state(false);
	let errorMsg = $state('');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		isSending = true;
		errorMsg = '';

		const { data, error: insertError } = await supabase
			.from('join_request')
			.insert({
				post_id: formData?.postId,
				request_profile_id: formData?.requestProfileId,
				guest_name: formData?.name,
				guest_email: formData?.email,
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
				formData?.name,
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

			window.location.href = `/find-partners/${formData?.postId}`;
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
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-3">
	<h2 class="text-xl font-bold sm:text-2xl">Confirm your request</h2>
	<ul class="flex flex-col gap-2 text-lg sm:text-xl">
		<li>
			<span class="font-medium">Username:</span>
			{formData?.name}
		</li>
		<li>
			<span class="font-medium">Email:</span>
			{formData?.email}
		</li>
		<li>
			<span class="font-medium">Time:</span>
			{formData?.date}&nbsp;
			{formatTimeToAMPM(formData?.startTime)} -
			{formatTimeToAMPM(formData?.endTime)}
		</li>
		<li class="flex flex-col">
			<span class="font-medium">Message:</span>
			<p>{formData?.message}</p>
		</li>
	</ul>
	<Button class="mt-3 w-full" type="submit" disabled={isSending}>
		{isSending ? 'Sending request...' : 'Confirm to Join'}
	</Button>

	{#if errorMsg}
		<p class="text-red-600">{errorMsg}</p>
	{/if}
</form>
