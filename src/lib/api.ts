// source: https://github.com/codeths/ethsbell-rewrite/blob/master/src/schedule/period.rs

export type PeriodKind =
	| {
			Class: string;
	  }
	| {
			ClassOrLunch: string;
	  }
	| 'Lunch'
	| 'Break'
	| 'AMSupport'
	| 'Passing'
	| 'BeforeSchool'
	| 'AfterSchool'
	| 'Announcements';

type PeriodName = string;

export interface Period {
	/**
	 * A human-friendly name for this period, like "First Period".
	 */
	friendly_name: PeriodName;

	/**
	 * The start of this period.
	 */
	start: string;

	/**
	 * The start of this period, formatted as the Unix epoch.
	 */
	start_timestamp: number;

	/**
	 * The end of this period.
	 */
	end: string;

	/**
	 * The end of this period, formatted as the Unix epoch.
	 */
	end_timestamp: number;

	/**
	 * The type of this period.
	 */
	kind: PeriodKind;
}

export type TeacherInfo = Record<
	PeriodName,
	{
		location: string | boolean;
		nodress: string | boolean;
		heart: string | boolean;
		chromebook: string | boolean;
	}
> & {
	/**
	 * The teacher's name
	 */
	name: string;
};

export type PEData = TeacherInfo[];

export type NullablePeriods = Period[] | null;

/**
 * [previous, current, future]
 */
export type TodayNowNear = [NullablePeriods, NullablePeriods, NullablePeriods];

export interface ScheduleData {
	friendly_name: string;
	periods: Period[];
	regex: string;
	/** red, green, blue */
	color: [number, number, number];
	/** Whether the schedule should be hidden by frontends */
	hide: boolean;
}
