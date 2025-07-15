<script lang="ts">
	import '../app.css';
	import TimeInit from '$lib/components/TimeInit.svelte';
	import DataLoader from '$lib/components/DataLoader.svelte';

	let { children } = $props();
</script>

<DataLoader>
	{@render children()}
</DataLoader>
<TimeInit />
