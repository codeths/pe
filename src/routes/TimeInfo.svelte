<script lang="ts">
	import { prettyDate } from '$lib/dateFormat';
	import { time } from '$lib/sharedTime.svelte';
</script>

<div class="h-auto text-center text-white sm:h-full sm:w-1/4">
	<div
		class="hidden h-1/4 flex-col justify-center gap-y-1 bg-[#c34614] p-2 text-2xl font-medium sm:flex"
	>
		<h1>
			{prettyDate(time)}
		</h1>
		<h1>
			{Intl.DateTimeFormat('en-US', {
				timeStyle: 'short',
			}).format(time)}
		</h1>
	</div>
	<div class="flex flex-col items-center bg-[#1a2741] p-2 sm:h-3/4">
		<div class="hidden w-full flex-col items-center sm:flex">
			<img src="/wildkit.svg" alt="Willie the Wildkit" class="my-4 w-3/4" />
			<div class="m-[5px] block h-[2px] w-8 bg-white"></div>
		</div>
		<p class="text-xl">Showing locations for</p>
	</div>
</div>
