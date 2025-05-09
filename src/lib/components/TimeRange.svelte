<script lang="ts">
	import { timeRange } from '$lib/utils/formatString';

	let { startDatetime, endDatetime, style = '' } = $props();
</script>

<span class="overflow-x-auto whitespace-pre {style}">
	{timeRange(startDatetime, endDatetime)}
</span>
