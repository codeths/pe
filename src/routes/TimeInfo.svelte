<script module lang="ts">
	import type { Period } from '$lib/api';
	interface SelectedState {
		state: Period | 'current';
	}

	export const selected = $state<SelectedState>({ state: 'current' });
</script>

<script lang="ts">
	import type { ScheduleDataState, CurrentPeriodsState } from '$lib/components/DataLoader.svelte';
	import { getContext } from 'svelte';
	import { prettyDate, getPeriodText } from '$lib/dateFormat';
	import { time } from '$lib/sharedTime.svelte';

	const scheduleData = getContext('current-schedule') as ScheduleDataState | undefined;
	const scheduledPeriods = $derived.by(() => {
		const scheduledPeriods = scheduleData?.state?.periods || [];

		// only allow AM Support or classes to show up
		return scheduledPeriods.filter((period) =>
			typeof period.kind === 'string' ? period.kind === 'AMSupport' : true
		);
	});

	const currentPeriods = getContext('current-periods') as CurrentPeriodsState | undefined;
	const periods = $derived(currentPeriods?.state.current || []);
</script>

<div class="h-auto text-center sm:h-full sm:w-1/4">
	<div
		class="2k:text-6xl hidden h-1/4 flex-col justify-center gap-y-1 bg-[#c34614] p-2 text-2xl font-medium text-white sm:flex"
	>
		<h1>
			{prettyDate(time)}
		</h1>
		<h1>
			{Intl.DateTimeFormat('en-US', {
				timeStyle: 'short',
			}).format(time)}
		</h1>
	</div>
	<div class="2k:p-5 flex flex-col items-center bg-[#1a2741] p-2 sm:h-3/4">
		<div class="tiny:flex hidden w-full flex-col items-center">
			<img src="/wildkit.svg" alt="Willie the Wildkit" class="my-4 w-2/3" />
			<div class="2k:m-[15px] 2k:h-[4px] 2k:w-16 m-[5px] block h-[2px] w-8 bg-white"></div>
		</div>
		<p class="2k:text-5xl text-xl text-white">Showing locations for</p>
		<select
			class="2k:max-w-160 2k:my-5 2k:text-3xl my-1 block max-w-80 rounded-md border-transparent bg-gray-100 text-center text-wrap focus:border-gray-500 focus:bg-white focus:ring-0"
			style="width: calc( 100% - var(--spacing) * 6 )"
			bind:value={selected.state}
		>
			<option value="current">Current Block</option>
			{#each scheduledPeriods as period}
				<option value={period}>{period.friendly_name}</option>
			{/each}
		</select>
		<div class="2k:text-5xl text-xl text-white">
			{#each periods as period}
				<p>{getPeriodText(period)}</p>
			{/each}
		</div>
	</div>
</div>
