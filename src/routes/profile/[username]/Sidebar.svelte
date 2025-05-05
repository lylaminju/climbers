<script lang="ts">
	import {
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
	} from 'flowbite-svelte';
	import {
		FileLinesOutline,
		MailBoxOutline,
		UserSolid,
	} from 'flowbite-svelte-icons';

	let { username, activeUrl }: { username: string; activeUrl: string } =
		$props();
</script>

<Sidebar {activeUrl} class="hidden w-full max-w-fit sm:block">
	<SidebarWrapper>
		<SidebarGroup>
			<SidebarItem label="Profile" href={`/profile/${username}`}>
				<svelte:fragment slot="icon">
					<UserSolid
						class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900"
					/>
				</svelte:fragment>
			</SidebarItem>
			<SidebarItem label="Posts" href={`/profile/${username}/posts`}>
				<svelte:fragment slot="icon">
					<FileLinesOutline
						class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900"
					/>
				</svelte:fragment>
			</SidebarItem>
			<SidebarItem label="Requests" href={`/profile/${username}/requests`}>
				<svelte:fragment slot="icon">
					<MailBoxOutline
						class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900"
					/>
				</svelte:fragment>
			</SidebarItem>
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
