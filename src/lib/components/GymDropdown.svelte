<script lang="ts">
	import type { ClimbingGym } from '$lib/types/types';
	import { Button, Dropdown, DropdownItem, Search } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';

	let {
		gyms,
		selectedGymId = $bindable(),
	}: {
		gyms: ClimbingGym[];
		selectedGymId: string;
	} = $props();

	let searchTerm = $state('');
	const gymSearchList = $derived(gyms);
	let filteredGyms = $derived(
		gymSearchList.filter((gym) =>
			gym.name.toLowerCase().includes(searchTerm.toLowerCase()),
		),
	);

	let selectDropdownOpen = $state(false);
</script>

<Button class="dropdown-btn">
	{selectedGymId
		? gyms.find((gym) => gym.gym_id === selectedGymId)?.name
		: 'Climbing gyms'}
	<ChevronDownOutline class="ms-1 h-6 w-6 text-white sm:ms-2 dark:text-white" />
</Button>
<Dropdown
	class="h-44 overflow-y-auto px-3 pb-3 text-sm sm:h-50"
	bind:open={selectDropdownOpen}
>
	<div slot="header" class="p-3">
		<Search size="md" bind:value={searchTerm} />
	</div>
	{#each filteredGyms as gym}
		<DropdownItem
			onclick={() => {
				selectedGymId = gym.gym_id;
				selectDropdownOpen = false;
			}}
			class="flex flex-row justify-between gap-2"
		>
			<span>{gym.name}</span>
			<span class="text-gray-500">{gym.city}</span>
		</DropdownItem>
	{/each}
</Dropdown>
