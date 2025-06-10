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
