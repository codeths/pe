<script lang="ts">
	import type { CurrentPeriodsState, PEDataState } from '$lib/components/DataLoader.svelte';
	import { getContext } from 'svelte';
	import ClassLocations from '$lib/components/ClassLocations.svelte';

	const currentPeriods = getContext('current-periods') as CurrentPeriodsState | undefined;
	const periods = $derived(currentPeriods?.state.current || []);

	const peDataContext = getContext('board-data') as PEDataState | undefined;
	const peData = $derived(peDataContext?.state || []);

	const periodNames = $derived(periods.map((period) => period.friendly_name));

	const displayedLocations = $derived.by(() => {
		let allLocations = [];
		for (const teacher of peData) {
			// 1. Get current classes for each teacher
			// 2. Exclude periods not listed in the spreadsheet data
			// 3. Also exclude classes where the location is blank or empty
			const currentClasses = periodNames
				.map((period) => ({
					teacher: teacher.name,
					period,
					status: teacher[period],
				}))
				.filter((classStatus) => !!classStatus.status)
				.filter(
					({ status }) => typeof status.location === 'string' && status.location.trim() !== ''
				);

			allLocations.push(...currentClasses);
		}

		return allLocations;
	});
</script>

<ClassLocations {displayedLocations} fullHeight />
