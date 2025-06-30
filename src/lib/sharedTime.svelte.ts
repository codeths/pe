import { SvelteDate } from 'svelte/reactivity';

const timestampQueryString = new URLSearchParams(window.location.search).get('timestamp');

export const time = timestampQueryString
	? new SvelteDate(Number.parseInt(timestampQueryString, 10) * 1000)
	: new SvelteDate();

export const initializer = () => {
	if (!timestampQueryString) {
		const interval = setInterval(() => {
			time.setTime(Date.now());
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}
};
