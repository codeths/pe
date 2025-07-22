import type { Period } from '$lib/api';
import { time } from '$lib/sharedTime.svelte';
import { dev } from '$app/environment';

const getOrdinalSuffix = (n: number): string => {
	const enOrdinalRules = new Intl.PluralRules('en-US', { type: 'ordinal' });

	const suffixes = new Map([
		['one', 'st'],
		['two', 'nd'],
		['few', 'rd'],
		['other', 'th'],
	]);
	const rule = enOrdinalRules.select(n);

	return suffixes.get(rule) as string;
};

export const prettyDate = (time: Date): string => {
	const dayString = Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	}).format(time);

	const suffix = getOrdinalSuffix(time.getDate());

	return `${dayString}${suffix}`;
};

/**
 * @param future
 * A time value in seconds
 */
const getDuration = (future: number) => {
	const now = time.getTime() / 1000;
	const timeLeft = Math.floor(future - now);
	const hours = Math.floor(timeLeft / 60 / 60);
	const minutes = Math.ceil((timeLeft / 60) % 60);
	const seconds = timeLeft % 60;
	const suffix = dev ? ` ${seconds}s` : ''; // only show seconds in dev mode

	return hours > 0 ? `${hours}h ${minutes}m${suffix}` : `${minutes}m${suffix}`;
};

export const getPeriodText = (period: Period) => {
	if (period.kind === 'BeforeSchool') {
		return `School starts in ${getDuration(period.end_timestamp)}`;
	} else if (period.kind === 'AfterSchool') {
		return "School's out!";
	} else {
		return `${period.friendly_name} ends in ${getDuration(period.end_timestamp)}`;
	}
};
