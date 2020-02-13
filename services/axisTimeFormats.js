import moment from 'moment'
import { timeFormat } from 'd3-time-format'
import {
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeWeek,
  timeMonth,
  timeYear
} from 'd3-time'

const formatMillisecond = timeFormat('.%L'),
  formatSecond = timeFormat(':%S'),
  formatMinute = timeFormat('%H:%M'),
  formatHour = timeFormat('%H:%M'),
  formatDay = timeFormat('%a'),
  formatWeek = timeFormat('%a'),
  formatMonth = timeFormat('%b %y'),
  formatYear = timeFormat('%Y'),
  emptyTime = () => ''

export default {
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
        : emptyTime)(date)
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
    return emptyTime(date)
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
