<script lang="ts">
	import TimeSelect from '$lib/components/TimeSelect.svelte';
	import { userStore } from '$lib/stores/user';
	import { Button, Input, Textarea } from 'flowbite-svelte';
	import RequestConfirmation from './RequestConfirmation.svelte';

	let { userAvailability, postId, posterEmail } = $props();

	let guestName = $state(null);
	let guestEmail = $state(null);
	let startTime = $state(userAvailability?.[0]?.start_time);
	let endTime = $state(userAvailability?.[0]?.end_time);
	let message = $state('');
	let showRequestForm = $state(true);

	let formData = $derived({
		postId,
		requestProfileId: $userStore?.id,
		guestName,
		guestEmail,
		date: userAvailability?.[0]?.date,
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
				<span>{userAvailability?.[0]?.date}</span>
				<TimeSelect bind:startTime bind:endTime />
			</div>
		</div>
		<div>
			<label for="message" class="mb-1 block">Message</label>
			<Textarea id="message" bind:value={message} />
		</div>

		<Button class="mt-2 w-full" type="submit">Proceed</Button>
	</form>
{:else}
	<RequestConfirmation {formData} />
{/if}
