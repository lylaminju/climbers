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
</script>

<Button class="dropdown-btn">
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
	<div slot="header" class="p-3">
		<Search size="md" bind:value={searchTerm} />
	</div>
	{#each filteredCities as city (city.name)}
		<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
			<Checkbox bind:checked={city.checked}>
				{capitalizeWords(city.name)}
			</Checkbox>
		</li>
	{/each}
</Dropdown>
