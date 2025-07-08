<script lang="ts">
	import type { PEDataState } from '$lib/components/DataLoader.svelte';
	import { getContext } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	const peDataContext = getContext('board-data') as PEDataState | undefined;
	const message = $derived(peDataContext?.state.message);
</script>

{#if message}
	<div class="flex items-center bg-red-400 p-2">
		<p class="grow text-center font-semibold">{message.text}</p>
		<button
			class="shrink-0 cursor-pointer rounded-md p-1 transition duration-200 [--icon-size:0.5] hover:bg-red-500 active:scale-110"
		>
			<Icon type="x-mark" />
		</button>
	</div>
{/if}
