<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack, setContext } from 'svelte';
	import { time } from '$lib/sharedTime.svelte';

	interface Props {
		children: Snippet;
	}

	type PeriodList = any[] | null;
	export interface CurrentPeriods {
		previous: PeriodList;
		current: PeriodList;
		future: PeriodList;
		random?: number;
	}
	export interface CurrentPeriodsState {
		state: CurrentPeriods;
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

	const updateCurrentPeriods = async () => {
		try {
			const req = await fetch(`${API_BASE}/today/now/near?timestamp=${untrack(() => currentTime)}`);
			const [previous, current, future] = await req.json();
			const data: CurrentPeriods = { previous, current, future, random: Math.random() };
			console.log('current classes:', data);
			currentPeriods.state = data;
		} catch (e) {
			console.error('Failed to fetch current periods:', e);
		}
	};

	$effect(() => {
		const currentPeriodInterval = setInterval(updateCurrentPeriods, 30_000);
		updateCurrentPeriods();

		return () => {
			clearInterval(currentPeriodInterval);
		};
	});
</script>

{@render children()}
