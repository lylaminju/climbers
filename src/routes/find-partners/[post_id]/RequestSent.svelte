<script lang="ts">
	import { Button } from 'flowbite-svelte';

	const { email, postId } = $props();

	function goToPost() {
		window.location.href = `/find-partners/${postId}`;
	}
</script>

<div class="flex flex-col items-center gap-3">
	<p class="text-center text-2xl">🎉</p>
	<p class="text-center text-2xl">Request sent!</p>
	<p class="text-center text-xl">
		Once your request has been accepted, <br />
		an email will be sent to <br />
		<span class="font-bold">{email}</span>
	</p>
	<Button onclick={goToPost} class="mt-3">Go back</Button>
</div>
