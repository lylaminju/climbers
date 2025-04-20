<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import type { User } from '@supabase/supabase-js';
	import { onMount } from 'svelte';

	let user = $state<User | null>(null);

	onMount(async () => {
		const { data } = await supabase.auth.getUser();
		user = data.user;

		if (!user) {
			goto('/');
		}
	});
</script>

<section class="flex flex-col gap-3">
	<h1>My Page</h1>
	<ul>
		<li>Username: {user?.user_metadata?.username}</li>
		<li>Email: {user?.email}</li>
	</ul>
	<button>Update profile</button>
</section>
