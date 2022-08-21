import { timeFormat, utcFormat } from 'd3-time-format'
import {
  utcSecond,
  utcMinute,
  utcHour,
  utcDay,
  utcWeek,
  utcMonth,
  utcYear,
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeWeek,
  timeMonth,
  timeYear
} from 'd3-time'

const formatMillisecond = utcFormat('.%L'),
  formatSecond = utcFormat(':%S'),
  formatMinute = utcFormat('%H:%M'),
  formatHour = utcFormat('%H:%M'),
  formatDay = utcFormat('%a'),
  formatWeek = utcFormat('%a'),
  formatMonth = utcFormat('%b %y'),
  formatYear = utcFormat('%Y')

export default function (d) {
  const date = d
  return (
    utcSecond(date) < date
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
      : formatYear
  )(date)
}
