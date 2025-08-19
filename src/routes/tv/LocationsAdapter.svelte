<script lang="ts">
	import type { CurrentPeriodsState, PEDataState } from '$lib/components/DataLoader.svelte';
	import { getContext } from 'svelte';
	import { stripPeriodSuffix } from '$lib/utils';
	import ClassLocations from '$lib/components/ClassLocations.svelte';

	const currentPeriods = getContext('current-periods') as CurrentPeriodsState | undefined;
	const periods = $derived({
		current: currentPeriods?.state.current || [],
		future: currentPeriods?.state.future || [],
	});

	const peDataContext = getContext('board-data') as PEDataState | undefined;
	const peData = $derived(peDataContext?.state.data || []);

	const periodNames = $derived.by(() => {
		let periodsShown = [...periods.current];
		if (periods.current.some((p) => p.kind === 'Passing' || p.kind === 'BeforeSchool')) {
			periodsShown.push(...periods.future);
		}

		return periodsShown.map((p) => p.friendly_name);
	});
	$inspect(periodNames);

	const displayedLocations = $derived.by(() => {
		let allLocations = [];
		const normalizedPeriodNames = periodNames.map(stripPeriodSuffix);
		for (const teacher of peData) {
			// 1. Get current classes for each teacher
			// 2. Exclude periods not listed in the spreadsheet data
			// 3. Also exclude classes where the location is blank or empty
			const currentClasses = normalizedPeriodNames
				.map((period) => ({
					teacher: teacher.name,
					period,
					status: teacher.classes[period],
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
