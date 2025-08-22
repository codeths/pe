<script lang="ts">
	import type { PEDataState } from '$lib/components/DataLoader.svelte';
	import type { Period } from '$lib/api';
	import { getContext } from 'svelte';
	import { stripPeriodSuffix } from '$lib/utils';
	import ClassLocations from '$lib/components/ClassLocations.svelte';

	interface Props {
		activePeriods: Period[];
	}
	const { activePeriods }: Props = $props();

	const peDataContext = getContext('board-data') as PEDataState | undefined;
	const peData = $derived(peDataContext?.state.data || []);

	const displayedLocations = $derived.by(() => {
		let allLocations = [];

		// using a Set ensures periods are unique
		const normalizedPeriodNames = new Set(
			activePeriods.map((p) => p.friendly_name).map(stripPeriodSuffix)
		);

		for (const teacher of peData) {
			// 1. Get current classes for each teacher
			// 2. Exclude periods not listed in the spreadsheet data
			// 3. Also exclude classes where the location is blank or empty
			const currentClasses = Array.from(normalizedPeriodNames)
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

<ClassLocations {displayedLocations} />
