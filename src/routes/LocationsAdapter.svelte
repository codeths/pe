<script lang="ts">
	import type { CurrentPeriodsState } from '$lib/components/DataLoader.svelte';
	import { getContext } from 'svelte';
	import ClassLocations from '$lib/components/ClassLocations.svelte';

	const currentPeriods = getContext('current-periods') as CurrentPeriodsState | undefined;

	const periods = $derived(currentPeriods?.state.current || []);
</script>

<ClassLocations {periods} />
