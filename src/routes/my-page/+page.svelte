<script lang="ts">
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/user';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	onMount(async () => {
		const { data } = await supabase.auth.getUser();
		userStore.set(data.user);

		if (!$userStore) {
			goto('/');
		}
	});
</script>

<section class="flex flex-col gap-3">
	<h1>My Page</h1>
	<ul>
		<li>Username: {$userStore?.user_metadata?.username}</li>
		<li>Email: {$userStore?.email}</li>
	</ul>
	<button>Update profile</button>
</section>
