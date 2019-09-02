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
  formatMinute = timeFormat('%I:%M'),
  formatHour = timeFormat('%H:%M'),
  formatDay = timeFormat('%e %b'),
  formatWeek = timeFormat('%e %b'),
  formatMonth = timeFormat('%B %Y'),
  formatYear = timeFormat('%Y'),
  emptyTime = () => ''

export default function(date) {
  return (timeSecond(date) < date
    ? emptyTime
    : timeMinute(date) < date
      ? emptyTime
      : timeHour(date) < date
        ? emptyTime
        : timeDay(date) < date
          ? emptyTime
          : timeMonth(date) < date
            ? timeWeek(date) < date
              ? formatDay
              : formatWeek
            : timeYear(date) < date
              ? emptyTime
              : emptyTime)(date)
}
