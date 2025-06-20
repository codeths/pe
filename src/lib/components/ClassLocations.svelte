<script lang="ts">
	import type { Period, PEData } from '$lib/api';
	import Icon from './Icon.svelte';
	const { periods, peData }: { periods: Period[]; peData: PEData } = $props();
	$inspect(periods);
	$inspect(peData);
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
	$inspect(displayedLocations);
</script>

<div
	class="m-8 grid gap-x-2 gap-y-4"
	style="grid-template-columns: repeat( auto-fit, minmax( 200px, auto ) )"
>
	{#each displayedLocations as classInfo}
		<div class="flex flex-col items-center text-center">
			<h1 class="text-4xl font-semibold">{classInfo.teacher}</h1>
			<p class="mb-2 text-2xl">{classInfo.status.location}</p>
			<div class="flex">
				{#if classInfo.status.nodress}
					<Icon type="no-shirt" --icon-size="1.5" />
				{:else}
					<Icon type="shirt" --icon-size="1.5" />
				{/if}
				<!-- {#if classInfo.status.heart}
					<Icon type="heart" --icon-size="1.5" />
				{/if} -->
				{#if classInfo.status.chromebook}
					<Icon type="laptop" --icon-size="1.5" />
				{/if}
			</div>
		</div>
	{/each}
</div>
