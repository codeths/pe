<script lang="ts">
	import type { PEDataState, CurrentPeriodsState } from '$lib/components/DataLoader.svelte';
	import { getContext } from 'svelte';
	import Legend from '$lib/components/Legend.svelte';
	import TimeInfo from './TimeInfo.svelte';
	import LocationsAdapter from './LocationsAdapter.svelte';
	import BannerNotification from '$lib/components/BannerNotification.svelte';

	const currentPeriods = getContext('current-periods') as CurrentPeriodsState | undefined;
	const periods = $derived({
		current: currentPeriods?.state.current || [],
		future: currentPeriods?.state.future || [],
	});

	const peDataContext = getContext('board-data') as PEDataState | undefined;
	const message = $derived(peDataContext?.state.message);

	const activePeriods = $derived.by(() => {
		let periodsShown = [...periods.current];
		if (periods.current.some((p) => p.kind === 'Passing' || p.kind === 'BeforeSchool')) {
			periodsShown.push(...periods.future);
		}

		return periodsShown;
	});
	$inspect(activePeriods);
</script>

<svelte:head>
	<title>ETHS PE Board</title>
</svelte:head>

<div class="flex h-screen flex-col">
	<TimeInfo {activePeriods} />
	{#if message?.fullscreen}
		<div class="flex grow flex-wrap place-content-center bg-red-400">
			<h1
				class="2k:text-[9rem] w-[85%] text-center text-7xl leading-[1.2] font-bold whitespace-pre-wrap"
			>
				{message.text}
			</h1>
		</div>
	{:else}
		<BannerNotification />
		<main class="grow">
			<LocationsAdapter {activePeriods} />
		</main>
	{/if}
	<footer class="2k:py-8 flex items-center bg-gray-300 py-4">
		<img src="/athletics.svg" alt="" class="2k:size-40 2k:ml-8 ml-4 size-20" />
		<div class="not-2k:text-2xl grow">
			<Legend />
		</div>
		<div class="2k:mr-40 2k:gap-x-8 mr-16 flex items-center gap-x-4">
			<div class="2k:text-5xl/normal text-center text-2xl">
				<p>See the full schedule here:</p>
				<a href="https://pe.ethsbell.app/" class="font-medium text-blue-600">pe.ethsbell.app</a>
			</div>
			<img src="/qr-code.webp" alt="QR Code" class="2k:size-40 size-20" />
		</div>
	</footer>
</div>
