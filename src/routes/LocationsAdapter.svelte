<script lang="ts">
	import type { CurrentPeriodsState, PEDataState } from '$lib/components/DataLoader.svelte';
	import { getContext } from 'svelte';
	import ClassLocations from '$lib/components/ClassLocations.svelte';

	const currentPeriods = getContext('current-periods') as CurrentPeriodsState | undefined;
	const periods = $derived(currentPeriods?.state.current || []);

	const peDataContext = getContext('board-data') as PEDataState | undefined;
	const peData = $derived(peDataContext?.state || []);
</script>

<ClassLocations {periods} {peData} />
