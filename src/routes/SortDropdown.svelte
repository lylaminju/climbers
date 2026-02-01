<script>
	import {
		Button,
		Dropdown,
		DropdownDivider,
		DropdownItem,
	} from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';

	const sortGroups = [
		[
			{ value: 'name-asc', label: 'Name: A to Z' },
			{ value: 'name-desc', label: 'Name: Z to A' },
		],
		[
			{ value: 'nearest', label: 'Nearest Distance' },
			{ value: 'farthest', label: 'Farthest Distance' },
		],
		// [
		// 	{ value: 'smallest', label: 'Smallest Climbing Area' },
		// 	{ value: 'largest', label: 'Largest Climbing Area' },
		// ],
		// [
		// 	{ value: 'cheapest', label: 'Price: Low to High' },
		// 	{ value: 'expensive', label: 'Price: High to Low' },
		// ],
	];

	const { selectedSortingOption = '', onSortChange = (value) => {} } = $props();
</script>

<Button
	class="dropdown-btn flex w-full flex-row justify-between overflow-x-hidden sm:w-fit"
	aria-label="Sorting options"
>
	{sortGroups.flat().find((option) => option.value === selectedSortingOption)
		?.label}
	<ChevronDownOutline class="ms-1 h-6 w-6 text-white sm:ms-2 dark:text-white" />
</Button>
<Dropdown>
	{#each sortGroups as group, index}
		{#each group as option}
			<DropdownItem
				onclick={() => {
					onSortChange(option.value);
				}}
				class={selectedSortingOption === option.value
					? 'bg-gray-100 dark:bg-gray-600'
					: ''}
			>
				{option.label}
			</DropdownItem>
		{/each}
		{#if index < sortGroups.length - 1}
			<DropdownDivider />
		{/if}
	{/each}
</Dropdown>
