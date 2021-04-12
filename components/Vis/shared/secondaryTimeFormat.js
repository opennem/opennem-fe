import { timeFormat, utcFormat } from 'd3-time-format'
import {
  utcSecond,
  utcMinute,
  utcHour,
  utcDay,
  utcWeek,
  utcMonth,
  utcYear
} from 'd3-time'

const formatMillisecond = utcFormat('.%L'),
  formatSecond = utcFormat(':%S'),
  formatMinute = utcFormat('%I:%M'),
  formatHour = utcFormat('%H:%M'),
  formatDay = utcFormat('%e %b'),
  formatWeek = utcFormat('%e %b'),
  formatMonth = utcFormat('%B %Y'),
  formatYear = utcFormat('%Y'),
  emptyTime = () => ''

export default function(date) {
  return (utcSecond(date) < date
    ? emptyTime
    : utcMinute(date) < date
      ? emptyTime
      : utcHour(date) < date
        ? emptyTime
        : utcDay(date) < date
          ? emptyTime
          : utcMonth(date) < date
            ? utcWeek(date) < date
              ? formatDay
              : formatWeek
            : utcYear(date) < date
              ? emptyTime
              : emptyTime)(date)
}
