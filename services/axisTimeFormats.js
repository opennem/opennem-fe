import { timeFormat, utcFormat } from 'd3-time-format'
import {
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeWeek,
  timeMonth,
  timeYear,
  utcSecond,
  utcMinute,
  utcHour,
  utcDay,
  utcWeek,
  utcMonth,
  utcYear
} from 'd3-time'

const formatMillisecond = timeFormat('.%L'),
  formatSecond = timeFormat(':%S'),
  formatMinute = timeFormat('%H:%M'),
  formatHour = timeFormat('%H:%M'),
  formatDay = timeFormat('%a'),
  formatWeek = timeFormat('%a'),
  formatMonth = timeFormat('%b %y'),
  formatYear = timeFormat('%Y'),
  empty = () => ''

export default {
  defaultFormat(date) {
    return (utcSecond(date) < date
      ? formatMillisecond
      : utcMinute(date) < date
        ? formatSecond
        : utcHour(date) < date
          ? formatMinute
          : utcDay(date) < date
            ? formatHour
            : utcMonth(date) < date
              ? utcWeek(date) < date
                ? formatDay
                : formatWeek
              : utcYear(date) < date
                ? formatMonth
                : formatYear)(date)
  },

  secondaryFormat(date) {
    const formatDay = utcFormat('%e %b')
    const formatWeek = utcFormat('%e %b')

    return (utcSecond(date) < date
      ? empty
      : utcMinute(date) < date
        ? empty
        : utcHour(date) < date
          ? empty
          : utcDay(date) < date
            ? empty
            : utcMonth(date) < date
              ? utcWeek(date) < date
                ? formatDay
                : formatWeek
              : utcYear(date) < date
                ? empty
                : empty)(date)
  },

  intervalDayTimeFormat(date) {
    return (timeSecond(date) < date
      ? formatMillisecond
      : timeMinute(date) < date
        ? formatSecond
        : timeHour(date) < date
          ? formatMinute
          : timeDay(date) < date
            ? formatHour
            : timeMonth(date) < date
              ? timeWeek(date) < date
                ? formatDay
                : formatWeek
              : timeYear(date) < date
                ? formatDay
                : formatYear)(date)
  },

  intervalDaySecondaryTimeFormat(date) {
    return (timeMonth(date) < date
      ? timeWeek(date) < date
        ? timeFormat('%e %b')
        : timeFormat('%e %b')
      : timeYear(date) < date
        ? timeFormat('%e %b')
        : empty)(date)
  },

  intervalWeekTimeFormat(date) {
    return (timeSecond(date) < date
      ? formatMillisecond
      : timeMinute(date) < date
        ? formatSecond
        : timeHour(date) < date
          ? formatMinute
          : timeDay(date) < date
            ? formatHour
            : timeMonth(date) < date
              ? timeWeek(date) < date
                ? timeFormat('%e %b')
                : timeFormat('%e %b')
              : timeYear(date) < date
                ? formatDay
                : formatYear)(date)
  },

  intervalWeekSecondaryTimeFormat(date) {
    return empty(date)
  },

  intervalMonthTimeFormat(date, showYear) {
    return (timeSecond(date) < date
      ? formatMillisecond
      : timeMinute(date) < date
        ? formatSecond
        : timeHour(date) < date
          ? formatMinute
          : timeDay(date) < date
            ? formatHour
            : timeMonth(date) < date
              ? timeWeek(date) < date
                ? formatDay
                : formatWeek
              : timeYear(date) < date
                ? showYear
                  ? timeFormat('%b %Y')
                  : timeFormat('%b')
                : formatYear)(date)
  },

  rangeAllIntervalMonthTimeFormat(date) {
    return (timeSecond(date) < date
      ? formatMillisecond
      : timeMinute(date) < date
        ? formatSecond
        : timeHour(date) < date
          ? formatMinute
          : timeDay(date) < date
            ? formatHour
            : timeMonth(date) < date
              ? timeWeek(date) < date
                ? formatDay
                : formatWeek
              : timeYear(date) < date
                ? timeFormat('%b')
                : formatYear)(date)
  }
}
