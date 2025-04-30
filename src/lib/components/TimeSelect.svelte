<script lang="ts">
	import { Select } from 'flowbite-svelte';
	import { MinusOutline } from 'flowbite-svelte-icons';

	// Generate time options for each half hour from 07:00 to 23:30
	const START_HOUR = 7;
	const END_HOUR = 23;
	const timeOptions: { value: string; name: string }[] = Array.from(
		{ length: (END_HOUR - START_HOUR + 1) * 2 }, // Total slots: hours * 2 (for 0 and 30 minutes)
		(_, i) => {
			const hour = START_HOUR + Math.floor(i / 2);
			const minute = i % 2 === 0 ? '00' : '30';
			const time = `${hour.toString().padStart(2, '0')}:${minute}`;

			return { value: `${time}:00`, name: time };
		},
	);

	let { startTime = $bindable(), endTime = $bindable() } = $props();
</script>

<div class="flex items-center gap-1">
	<Select
		class="w-24"
		items={timeOptions}
		placeholder="--:--"
		bind:value={startTime}
		required
	/>
	<MinusOutline />
	<Select
		class="w-24"
		items={timeOptions.filter((option) => option.value > startTime)}
		placeholder="--:--"
		bind:value={endTime}
		required
	/>
</div>
