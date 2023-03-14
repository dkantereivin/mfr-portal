import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import timezone from 'dayjs/plugin/timezone';
import utcPlugin from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

export const TIMEZONE = 'America/Toronto';

dayjs.extend(weekday);
dayjs.extend(timezone);
dayjs.extend(utcPlugin);
dayjs.extend(customParseFormat);

dayjs.tz.setDefault(TIMEZONE);

export const utcTime = () => dayjs().utc();
export const localTime = () => dayjs().tz(TIMEZONE);
export const parseLocal = (datetime: string | Date) =>
	datetime instanceof Date ? dayjs(datetime).tz(TIMEZONE, true) : dayjs.tz(datetime, TIMEZONE);
export const parseUtc = (datetime: string | Date) => dayjs.utc(datetime);
export const parseDate = (date: string | null, utc = false) =>
	utc ? dayjs.utc(date, 'YYYY-MM-DD') : dayjs.tz(date, 'YYYY-MM-DD', TIMEZONE);
export const trainingTimeForDate = (date: string) =>
	parseDate(date).hour(17).minute(0).second(0).millisecond(0);

export { dayjs };
