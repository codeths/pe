<script lang="ts">
	export type IconType = 'laptop' | 'shirt' | 'no-shirt';
	import Laptop from '$lib/icons/laptop.svg';
	import Shirt from '$lib/icons/shirt.svg';
	import NoShirt from '$lib/icons/no-shirt.svg';

	const { type }: { type: IconType } = $props();

	const icons = {
		'laptop': Laptop,
		'shirt': Shirt,
		'no-shirt': NoShirt,
	};
</script>

<img src={icons[type]} alt="{type} icon" class="mx-1" />

<style>
	img {
		width: 2em;
		height: 2em;
		vertical-align: -0.125em;
	}
</style>
