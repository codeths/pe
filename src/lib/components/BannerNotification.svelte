<script lang="ts">
	import type { PEDataState } from '$lib/components/DataLoader.svelte';
	import { getContext } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	const { canDismiss = false }: { canDismiss?: boolean } = $props();
	const storageKey = 'DismissedMessageID';

	let dismissedID = $state<string | null>(null);

	const peDataContext = getContext('board-data') as PEDataState | undefined;
	const message = $derived(peDataContext?.state.message);

	const isHidden = $derived(canDismiss && message?.id === dismissedID && dismissedID !== null);

	const dismissMessage = (id: string | null) => {
		if (id) {
			window.localStorage.setItem(storageKey, id);
			dismissedID = id;
		}
	};

	$effect(() => {
		dismissedID = window.localStorage.getItem(storageKey);
	});
</script>

{#if message && !isHidden}
	<div class="2k:p-5 flex items-center bg-red-400 p-2">
		<p class="2k:text-5xl grow text-center text-xl font-semibold whitespace-pre-wrap 2xl:text-2xl">
			{message.text}
		</p>
		{#if canDismiss}
			<button
				onclick={() => dismissMessage(message.id)}
				class="2k:[--icon-size:1] shrink-0 cursor-pointer rounded-md p-1 transition duration-200 [--icon-size:0.5] hover:bg-red-500 active:scale-110"
			>
				<Icon type="x-mark" />
			</button>
		{/if}
	</div>
{/if}
