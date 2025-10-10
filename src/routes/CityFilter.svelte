<script lang="ts">
	import { capitalizeWords, formatCamelCase } from '$lib/utils/formatString';
	import { Button, Checkbox, Dropdown, Search } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';

	let {
		cities,
		isMobile
	}: { cities: { name: string; checked: boolean }[]; isMobile: boolean } =
		$props();

	let searchTerm = $state('');

	let filteredCities = $derived(
		cities.filter((city) =>
			city.name.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	// Calculate select-all checkbox state
	let checkedCount = $derived(
		filteredCities.filter((city) => city.checked).length
	);
	let isAllChecked = $derived(
		checkedCount > 0 &&
			checkedCount === filteredCities.length &&
			filteredCities.length > 0
	);
	let isIndeterminate = $derived(
		checkedCount > 0 && checkedCount < filteredCities.length
	);

	function toggleSelectAll() {
		// If any cities are checked (indeterminate or all checked), uncheck all
		// If none are checked, check all
		const shouldCheck = checkedCount === 0;
		filteredCities.forEach((city) => {
			city.checked = shouldCheck;
		});
	}
</script>

<Button class="dropdown-btn overflow-x-scroll sm:max-w-[300px]">
	{#if isMobile}
		Cities
	{:else}
		{filteredCities.filter((city) => city.checked).length === 0
			? 'Cities'
			: filteredCities
					.filter((city) => city.checked)
					.map((city) => formatCamelCase(city.name))
					.join(', ')}
	{/if}
	<ChevronDownOutline class="ms-1 h-6 w-6 text-white sm:ms-2 dark:text-white" />
</Button>
<Dropdown class="h-44 overflow-y-auto px-3 pb-3 text-sm sm:h-50">
	<div slot="header" class="space-y-2 p-3">
		<Search size="md" bind:value={searchTerm} />
		{#if checkedCount === 0}
			<Checkbox class="text-xs" checked={false} onclick={toggleSelectAll}>
				Select All
			</Checkbox>
		{:else}
			<Checkbox
				class="text-xs"
				checked={isAllChecked}
				indeterminate={isIndeterminate}
				onclick={toggleSelectAll}
			>
				Clear
			</Checkbox>
		{/if}
	</div>
	{#each filteredCities as city (city.name)}
		<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
			<Checkbox bind:checked={city.checked}>
				{capitalizeWords(city.name)}
			</Checkbox>
		</li>
	{/each}
</Dropdown>
