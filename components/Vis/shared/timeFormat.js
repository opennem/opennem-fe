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
  formatYear = timeFormat('%Y')

export default function(d) {
  const date = d
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
              ? formatMonth
              : formatYear)(date)
}
