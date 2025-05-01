<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { requestToJoinTemplate } from '$lib/utils/emailTemplates';
	import { formatTimeToAMPM } from '$lib/utils/formatString';
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
				throw new Error('Failed to create join request');
			}

			const posterEmail = formData?.posterEmail;

			if (!posterEmail) {
				throw new Error('Failed to get a poster email');
			}

			const { statusCode, message, name } = await sendRequestEmail(
				posterEmail,
				formData?.name,
				formData?.postId,
			);

			if (statusCode !== undefined) {
				throw new Error(`${statusCode} ${name}: ${message}`);
			}

			window.location.href = `/find-partners/${formData?.postId}`;
		} catch (error) {
			console.error(error);
			errorMsg = 'Failed to send an email';

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

	async function sendRequestEmail(
		email: string,
		senderName: string,
		postId: string,
	) {
		try {
			const requestBody = JSON.stringify({
				email,
				subject: '[ClimberzDay] Request to Join',
				html: requestToJoinTemplate(senderName, formData?.message, postId),
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
