<script lang="ts">
	import type { IconType } from '$lib/components/Icon.svelte';
	import Icon from '$lib/components/Icon.svelte';
</script>

{#snippet item(type: IconType, text: string)}
	<div class="2k:[--icon-size:3] flex items-center">
		<Icon {type} />
		<p class="2k:text-6xl 2k:ml-6 max-2k:font-medium ml-2 2xl:text-3xl">{text}</p>
	</div>
{/snippet}

<div class="2k:gap-x-16 flex flex-wrap justify-center gap-x-6 gap-y-2">
	<!-- {@render item('heart', 'HR Monitor')} -->
	{@render item('shirt', 'Uniform')}
	{@render item('no-shirt', 'No Uniform')}
	{@render item('laptop', 'Chromebook')}
</div>
