<script lang="ts">
	import type { CurrentPeriodsState } from '$lib/components/DataLoader.svelte';
	import { getContext } from 'svelte';

	import Legend from '$lib/components/Legend.svelte';
	import TimeInfo, { selected } from './TimeInfo.svelte';
	import LocationsAdapter from './LocationsAdapter.svelte';
	import BannerNotification from '$lib/components/BannerNotification.svelte';

	const currentPeriods = getContext('current-periods') as CurrentPeriodsState | undefined;
	const periods = $derived({
		current: currentPeriods?.state.current || [],
		future: currentPeriods?.state.future || [],
	});

	const activePeriods = $derived.by(() => {
		if (selected.state === 'current') {
			let periodsShown = [...periods.current];
			if (periods.current.some((p) => p.kind === 'Passing' || p.kind === 'BeforeSchool')) {
				periodsShown.push(...periods.future);
			}

			return periodsShown;
		} else {
			return [selected.state];
		}
	});
	$inspect(activePeriods);
</script>

<svelte:head>
	<title>ETHS PE Board</title>
</svelte:head>

<div
	class="flex flex-col not-supports-[height:100dvh]:h-screen supports-[height:100dvh]:h-dvh sm:flex-row"
>
	<TimeInfo {activePeriods} />
	<div class="flex h-full flex-col overflow-y-auto sm:w-3/4">
		<BannerNotification canDismiss />
		<main class="grow"><LocationsAdapter {activePeriods} /></main>
		<footer
			class="h-small:visible 2k:py-8 invisible sticky bottom-0 flex items-center justify-center bg-gray-300 py-4"
		>
			<Legend />
		</footer>
	</div>
</div>
