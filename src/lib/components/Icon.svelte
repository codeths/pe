<script lang="ts">
	export type IconType = 'laptop' | 'shirt' | 'no-shirt' | 'heart';
	import Laptop from '$lib/icons/laptop.svg';
	import Shirt from '$lib/icons/shirt.svg';
	import NoShirt from '$lib/icons/no-shirt.svg';
	import Heart from '$lib/icons/heart.svg';

	const { type }: { type: IconType } = $props();

	const icons = {
		'laptop': Laptop,
		'shirt': Shirt,
		'no-shirt': NoShirt,
		'heart': Heart,
	};
</script>

<img src={icons[type]} alt="{type} icon" class="mx-1" />

<style>
	img {
		width: calc(2em * var(--icon-size, 1));
		height: calc(2em * var(--icon-size, 1));
		vertical-align: -0.125em;
	}
</style>
