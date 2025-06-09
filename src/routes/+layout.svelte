<script lang="ts">
	import '../app.css';
	import TimeInit from '$lib/components/TimeInit.svelte';

	let { children } = $props();
</script>

{@render children()}
<TimeInit />
