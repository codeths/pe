<script lang="ts">
	import DataLoader from '$lib/components/DataLoader.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import TimeInfo from './TimeInfo.svelte';
	import LocationsAdapter from './LocationsAdapter.svelte';
</script>

<svelte:head>
	<title>ETHS PE Board</title>
</svelte:head>

<DataLoader>
	<div class="flex h-screen flex-col">
		<TimeInfo />
		<main class="grow"><LocationsAdapter /></main>
		<footer class="2k:py-8 flex items-center bg-gray-300 py-4">
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
</DataLoader>
