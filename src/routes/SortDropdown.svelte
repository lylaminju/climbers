<script>
	import { Button, Dropdown, DropdownDivider, DropdownItem } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';

	const sortGroups = [
		[
			{ value: 'name-asc', label: 'Name (A → Z)' },
			{ value: 'name-desc', label: 'Name (Z → A)' },
		],
		[
			{ value: 'nearest', label: 'Nearest Distance' },
			{ value: 'farthest', label: 'Farthest Distance' },
		],
		[
			{ value: 'smallest', label: 'Smallest Climbing Area' },
			{ value: 'largest', label: 'Largest Climbing Area' },
		],
		[
			{ value: 'cheapest', label: 'Price: Low to High' },
			{ value: 'expensive', label: 'Price: High to Low' },
		],
	];

	const { selectedSortingOption = '', onSortChange = (value) => {} } = $props();
</script>

<div id="sort" class="w-full">
	<Button
		class="flex w-full flex-row justify-between sm:min-w-[246px]"
		aria-label="Sorting options"
	>
		{sortGroups.flat().find((option) => option.value === selectedSortingOption)?.label}
		<ChevronDownOutline class="ms-2 h-6 w-6 text-white dark:text-white" />
	</Button>
	<Dropdown>
		{#each sortGroups as group, index}
			{#each group as option}
				<DropdownItem
					onclick={() => {
						onSortChange(option.value);
					}}
					class={selectedSortingOption === option.value ? 'bg-gray-100 dark:bg-gray-600' : ''}
				>
					{option.label}
				</DropdownItem>
			{/each}
			{#if index < sortGroups.length - 1}
				<DropdownDivider />
			{/if}
		{/each}
	</Dropdown>
</div>
