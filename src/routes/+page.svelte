<script lang="ts">
	import Legend from '$lib/components/Legend.svelte';
	import DataLoader from '$lib/components/DataLoader.svelte';
	import TimeInfo from './TimeInfo.svelte';
	import LocationsAdapter from './LocationsAdapter.svelte';
</script>

<svelte:head>
	<title>ETHS PE Board</title>
</svelte:head>

<div class="flex h-screen flex-col sm:flex-row">
	<DataLoader>
		<TimeInfo />
		<div class="flex h-full flex-col overflow-y-auto sm:w-3/4">
			<main class="grow"><LocationsAdapter /></main>
			<footer class="sticky bottom-0 flex items-center justify-center bg-gray-300 py-4">
				<Legend />
			</footer>
		</div>
	</DataLoader>
</div>
