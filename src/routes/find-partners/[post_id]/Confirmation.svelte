<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { formatTimeToAMPM } from '$lib/utils/formatString';
	import { Button } from 'flowbite-svelte';

	let { formData } = $props();

	let isSending = $state(false);
	let errorMsg = $state('');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		isSending = true;

		try {
			// INSERT INTO join_request
			const { data, error } = await supabase.from('join_request').insert({
				post_id: formData?.postId,
				profile_id: formData?.profileId,
				guest_name: formData?.name,
				guest_email: formData?.email,
				date: formData?.date,
				start_time: formData?.startTime,
				end_time: formData?.endTime,
				message: formData?.message,
			});

			if (error) {
				throw new Error('Failed to request');
			}

			await sendRequestEmail(formData?.posterEmail, formData?.name, formData?.postId);

			window.location.href = `/find-partners/${formData?.postId}`;
		} catch (err) {
			console.error(err);
			errorMsg = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			isSending = false;
		}
	}

	async function sendRequestEmail(email: string, senderName: string, postId: string) {
		try {
			const requestBody = JSON.stringify({
				email,
				subject: '[ClimberzDay] Request to Join',
				html: `
					<h1>Request to join</h1>
					<p>A climber <b>${senderName}</b> sent a request to join your climbing.</p>
					<a href="http://localhost:5173/find-partners/${postId}">View Post</a>
				`,
			});
			const response = await fetch('/find-partners/[post_id]/request-email', {
				method: 'POST',
				body: requestBody,
			});
			const data = await response.json();
		} catch (error) {
			throw new Error('Failed to send request email.');
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
			{formatTimeToAMPM(formData?.startTime)} - {formatTimeToAMPM(formData?.endTime)}
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
