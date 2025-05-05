<script lang="ts">
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import {
		FileLinesOutline,
		MailBoxOutline,
		UserSolid,
	} from 'flowbite-svelte-icons';

	let { username }: { username: string } = $props();
</script>

<ButtonGroup class="block grid w-full grid-cols-3 shadow-none sm:hidden">
	<Button href={`/profile/${username}`} outline color="light">
		<UserSolid class="me-2 h-4 w-4" />
		Profile
	</Button>
	<Button href={`/profile/${username}/posts`} outline color="light">
		<FileLinesOutline class="me-2 h-4 w-4" />
		Posts
	</Button>
	<Button href={`/profile/${username}/requests`} outline color="light">
		<MailBoxOutline class="me-2 h-4 w-4" />
		Requests
	</Button>
</ButtonGroup>
