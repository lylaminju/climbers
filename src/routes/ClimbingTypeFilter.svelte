<script lang="ts">
	import ClimberIcon from '$lib/icons/ClimberIcon.svelte';
	import type { ClimbingType } from '$lib/types/types';
	import { formatCamelCase } from '$lib/utils/formatString';
	import { Button, Checkbox, Dropdown } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';

	const {
		climbingType,
		isMobile
	}: { climbingType: ClimbingType; isMobile: boolean } = $props();
</script>

<Button class="dropdown-btn text-nowrap">
	{#if isMobile}
		<ClimberIcon styles="w-5 stroke-white fill-white" />
	{:else}
		{Object.values(climbingType).every((v) => !v)
			? 'Climbing Types'
			: Object.entries(climbingType)
					.filter(([type, isSelected]) => isSelected)
					.map(([type]) => formatCamelCase(type))
					.join(', ')}
	{/if}
	<ChevronDownOutline class="ms-0 h-6 w-6 text-white sm:ms-2 dark:text-white" />
</Button>
<Dropdown class="w-48 space-y-1 p-2 text-sm sm:p-3">
	<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
		<Checkbox bind:checked={climbingType.boulder}>Boulder</Checkbox>
	</li>
	<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
		<Checkbox bind:checked={climbingType.autoBelay}>Auto belay</Checkbox>
	</li>
	<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
		<Checkbox bind:checked={climbingType.topRope}>Top rope</Checkbox>
	</li>
	<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
		<Checkbox bind:checked={climbingType.lead}>Lead</Checkbox>
	</li>
</Dropdown>
