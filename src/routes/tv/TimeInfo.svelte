<script lang="ts">
	import type { ScheduleDataState } from '$lib/components/DataLoader.svelte';
	import type { Period } from '$lib/api';
	import { getContext } from 'svelte';
	import { prettyDate, getPeriodText } from '$lib/dateFormat';
	import { time } from '$lib/sharedTime.svelte';

	interface Props {
		activePeriods: Period[];
	}
	const { activePeriods }: Props = $props();

	const scheduleData = getContext('current-schedule') as ScheduleDataState | undefined;
	const todayInfo = $derived.by(() => {
		if (scheduleData?.state) {
			return scheduleData.state;
		} else {
			return {
				friendly_name: '',
				color: [195, 70, 20],
			};
		}
	});
	const colors = $derived.by(() => {
		const [r, g, b] = todayInfo.color;
		const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

		return {
			background: `rgb(${r}, ${g}, ${b})`,
			text: luma > 128 ? 'var(--color-black)' : 'var(--color-white)',
		};
	});
</script>

<header
	class="2k:p-8 grid grid-cols-3 p-4"
	style:background-color={colors.background}
	style:color={colors.text}
>
	<h1 class="2k:text-6xl text-3xl">
		{prettyDate(time)}
	</h1>
	<div class="2k:text-5xl text-center text-2xl">
		<p>
			{Intl.DateTimeFormat('en-US', {
				timeStyle: 'short',
			}).format(time)}
		</p>
		<h1 class="2k:mt-4 font-bold font-stretch-expanded">{todayInfo.friendly_name}</h1>
	</div>
	<div class="2k:text-5xl/normal text-right text-2xl">
		{#each activePeriods as period}
			<p>{getPeriodText(period)}</p>
		{/each}
	</div>
</header>
