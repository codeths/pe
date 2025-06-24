<script lang="ts">
	import Icon from './Icon.svelte';

	interface DisplayedLocation {
		teacher: string;
		period: string;
		status: {
			location: string | boolean;
			nodress: string | boolean;
			heart: string | boolean;
			chromebook: string | boolean;
		};
	}
	type DisplayedLocations = DisplayedLocation[];

	const { displayedLocations }: { displayedLocations: DisplayedLocations } = $props();
</script>

<div
	class="m-8 grid gap-x-2 gap-y-4"
	style="grid-template-columns: repeat( auto-fit, minmax( 200px, auto ) )"
>
	{#each displayedLocations as classInfo}
		<div class="flex flex-col items-center text-center">
			<h1 class="text-4xl font-semibold">{classInfo.teacher}</h1>
			<p class="mb-2 text-2xl">{classInfo.status.location}</p>
			<div class="flex">
				{#if classInfo.status.nodress}
					<Icon type="no-shirt" --icon-size="1.5" />
				{:else}
					<Icon type="shirt" --icon-size="1.5" />
				{/if}
				<!-- {#if classInfo.status.heart}
					<Icon type="heart" --icon-size="1.5" />
				{/if} -->
				{#if classInfo.status.chromebook}
					<Icon type="laptop" --icon-size="1.5" />
				{/if}
			</div>
		</div>
	{/each}
</div>
