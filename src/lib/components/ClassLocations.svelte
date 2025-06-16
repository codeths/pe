<script lang="ts">
	import type { Period, PEData } from '$lib/api';
	const { periods, peData }: { periods: Period[]; peData: PEData } = $props();
	$inspect(periods);
	const periodNames = $derived(periods.map((period) => period.friendly_name));
</script>

<p>Current classes: {periods.length}</p>
{#each periodNames as name}
	<p>{name}</p>
{/each}

<br />
<details open>
	<summary>Teachers: {peData.length}</summary>
	<ul>
		{#each peData as teacher}
			<li>{teacher.name}</li>
		{/each}
	</ul>
</details>
