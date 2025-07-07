<script lang="ts">
	import Icon from './Icon.svelte';

	interface DisplayedLocation {
		teacher: string;
		period: string;
		status: {
			location: string;
			nodress: boolean;
			heart: boolean;
			chromebook: boolean;
		};
	}
	type DisplayedLocations = DisplayedLocation[];

	const {
		displayedLocations,
		fullHeight = false,
	}: { displayedLocations: DisplayedLocations; fullHeight?: boolean } = $props();
</script>

<div
	class:h-full={fullHeight}
	class={[
		'2k:[--grid-w-multiplier:2] grid place-items-center gap-y-4 p-8',
		fullHeight ? (displayedLocations.length > 24 ? 'gap-x-2' : 'gap-x-20') : 'gap-x-2',
	]}
	style="grid-template-columns: repeat( auto-fit, minmax( calc( 200px * var( --grid-w-multiplier, 1) ), auto ) )"
>
	{#each displayedLocations as classInfo}
		<div class="2k:gap-y-4 flex flex-col items-center text-center">
			<h1 class="2k:text-8xl text-4xl font-semibold font-stretch-condensed">{classInfo.teacher}</h1>
			<p class="2k:text-6xl mb-2 text-2xl">{classInfo.status.location}</p>
			<div class="2k:[--icon-size:4] flex [--icon-size:1.5]">
				{#if classInfo.status.nodress}
					<Icon type="no-shirt" />
				{:else}
					<Icon type="shirt" />
				{/if}
				{#if classInfo.status.heart}
					<Icon type="heart" />
				{/if}
				{#if classInfo.status.chromebook}
					<Icon type="laptop" />
				{/if}
			</div>
		</div>
	{/each}
</div>
