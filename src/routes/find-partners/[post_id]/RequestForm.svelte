<script lang="ts">
	import TimeSelect from '$lib/components/TimeSelect.svelte';
	import { userStore } from '$lib/stores/user';
	import { timestampToDate, timestampToTime } from '$lib/utils/formatString';
	import { Button, Input, Textarea } from 'flowbite-svelte';
	import RequestConfirmation from './RequestConfirmation.svelte';

	type Props = {
		postId: string;
		posterEmail: string;
		start_datetime: string;
		end_datetime: string;
	};
	const { postId, posterEmail, start_datetime, end_datetime }: Props = $props();

	let guestName = $state(null);
	let guestEmail = $state(null);
	let startTime = $derived(timestampToTime(start_datetime));
	let endTime = $derived(timestampToTime(end_datetime));
	let message = $state('');
	let showRequestForm = $state(true);

	let formData = $derived({
		postId,
		requestProfileId: $userStore?.id,
		guestName,
		guestEmail,
		date: timestampToDate(start_datetime),
		startTime,
		endTime,
		message,
		posterEmail,
	});

	async function handleSubmit() {
		showRequestForm = false;
	}
</script>

{#if showRequestForm}
	<form onsubmit={handleSubmit} class="space-y-4">
		<h2 class="text-xl font-bold sm:text-2xl">Request to Join</h2>
		{#if !$userStore?.id}
			<div>
				<label for="name" class="mb-1 block">Display Name</label>
				<Input id="name" type="text" bind:value={guestName} required />
			</div>
			<div>
				<label for="email" class="mb-1 block">Email</label>
				<Input id="email" type="email" bind:value={guestEmail} required />
			</div>
		{/if}
		<div>
			<label for="time-range">Time</label>
			<div class="flex items-center gap-3">
				<span class="whitespace-nowrap">{timestampToDate(start_datetime)}</span>
				<TimeSelect bind:startTime bind:endTime style="w-21 sm:w-24" />
			</div>
		</div>
		<div>
			<label for="message" class="mb-1 block">
				Message
				<span class="text-xs text-gray-500">(optional)</span>
			</label>
			<Textarea id="message" bind:value={message} class="min-h-[100px]" />
		</div>

		<Button class="mt-2 w-full" type="submit">Proceed</Button>
	</form>
{:else}
	<RequestConfirmation {formData} />
{/if}
