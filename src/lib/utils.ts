/**
 * Removes a "suffix" from the name of a period, if one exists.
 * ex: `Block 5A` becomes `Block 5`
 */
export function stripPeriodSuffix(periodName: string) {
	const match = /^.+ \d[A-Za-z]$/.test(periodName);
	return match ? periodName.slice(0, -1) : periodName;
}
