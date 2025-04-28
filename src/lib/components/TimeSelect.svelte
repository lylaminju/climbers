<script lang="ts">
	import { Select } from 'flowbite-svelte';
	import { MinusOutline } from 'flowbite-svelte-icons';

	// Generate time options for each hour (00:00, 01:00, ..., 23:00)
	const timeOptions = Array.from({ length: 24 }, (_, i) => {
		const time = `${i.toString().padStart(2, '0')}:00`;
		return { value: `${time}:00`, name: time };
	});

	let { id, startTime, endTime } = $props();
</script>

<div class="flex items-center gap-1">
	<Select
		class="w-24"
		items={timeOptions}
		placeholder="--:--"
		bind:value={startTime}
		onchange={(e) => (startTime = (e.target as HTMLSelectElement).value)}
		required
	/>
	<MinusOutline />
	<Select
		class="w-24"
		items={timeOptions.filter((option) => option.value > startTime)}
		placeholder="--:--"
		bind:value={endTime}
		onchange={(e) => (endTime = (e.target as HTMLSelectElement).value)}
		required
	/>
</div>
