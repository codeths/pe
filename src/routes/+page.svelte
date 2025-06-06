<script>
	import Legend from '$lib/components/Legend.svelte';
</script>

<svelte:head>
	<title>ETHS PE Board</title>
</svelte:head>

<div class="flex h-screen">
	<div class="h-full w-1/4 bg-orange-400">time info</div>
	<div class="flex h-full w-3/4 flex-col">
		<main class="grow"></main>
		<footer class="flex h-1/10 items-center justify-center bg-gray-300">
			<Legend />
		</footer>
	</div>
</div>
