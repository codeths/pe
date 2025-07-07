<script lang="ts">
	import type { TodayNowNear, NullablePeriods, PEData, ScheduleData } from '$lib/api';
	import type { Snippet } from 'svelte';
	import { untrack, setContext } from 'svelte';
	import { time } from '$lib/sharedTime.svelte';

	interface Props {
		children: Snippet;
	}

	export interface CurrentPeriods {
		previous: NullablePeriods;
		current: NullablePeriods;
		future: NullablePeriods;
		random?: number;
	}
	export interface CurrentPeriodsState {
		state: CurrentPeriods;
	}

	export interface ScheduleDataState {
		state: ScheduleData | null;
	}

	export interface PEDataState {
		state: PEData;
	}

	let { children }: Props = $props();

	const API_BASE = 'https://ethsbell.app/api/v1';

	const currentTime = $derived(Math.floor(time.getTime() / 1000));
	const currentPeriods = $state<CurrentPeriodsState>({
		state: {
			previous: null,
			current: null,
			future: null,
		},
	});
	setContext('current-periods', currentPeriods);

	const currentSchedule = $state<ScheduleDataState>({
		state: null,
	});
	setContext('current-schedule', currentSchedule);

	const boardData = $state<PEDataState>({
		state: {
			data: [],
		},
	});
	setContext('board-data', boardData);

	const updateCurrentPeriods = async () => {
		try {
			const req = await fetch(`${API_BASE}/today/now/near?timestamp=${untrack(() => currentTime)}`);
			const [previous, current, future] = (await req.json()) as TodayNowNear;
			const data: CurrentPeriods = { previous, current, future, random: Math.random() };
			console.log('current classes:', data);
			currentPeriods.state = data;
		} catch (e) {
			console.error('Failed to fetch current periods:', e);
		}
	};

	const updateScheduleData = async () => {
		try {
			const req = await fetch(`${API_BASE}/today?timestamp=${untrack(() => currentTime)}`);
			const data = (await req.json()) as ScheduleData;
			currentSchedule.state = data;
		} catch (e) {
			console.error('Failed to fetch schedule data:', e);
		}
	};

	const updateBoardData = async () => {
		try {
			const req = await fetch('https://s3.codeths.dev/pe-board/data', { cache: 'no-cache' });
			const data = (await req.json()) as PEData;
			boardData.state = data;
		} catch (e) {
			console.error('Failed to fetch spreadsheet data:', e);
		}
	};

	$effect(() => {
		const currentPeriodInterval = setInterval(updateCurrentPeriods, 30_000);
		updateCurrentPeriods();

		const scheduleDataInterval = setInterval(updateScheduleData, 30 * 60_000);
		updateScheduleData();

		const boardDataInterval = setInterval(updateBoardData, 15_000);
		updateBoardData();

		return () => {
			clearInterval(currentPeriodInterval);
			clearInterval(scheduleDataInterval);
			clearInterval(boardDataInterval);
		};
	});
</script>

{@render children()}
