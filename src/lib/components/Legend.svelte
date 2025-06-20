<script lang="ts">
	import type { IconType } from '$lib/components/Icon.svelte';
	import Icon from '$lib/components/Icon.svelte';
</script>

{#snippet item(type: IconType, text: string)}
	<div class="flex items-center">
		<Icon {type} />
		<p class="ml-2 font-medium">{text}</p>
	</div>
{/snippet}

<div class="flex flex-wrap justify-center gap-x-6 gap-y-2">
	<!-- {@render item('heart', 'HR Monitor')} -->
	{@render item('shirt', 'Uniform')}
	{@render item('no-shirt', 'No Uniform')}
	{@render item('laptop', 'Chromebook')}
</div>
