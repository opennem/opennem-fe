import {
  utcSecond,
  utcMinute,
  utcHour,
  utcDay,
  utcWeek,
  utcMonth,
  utcYear
} from 'd3-time'

export default function (time) {
  if (time <= 64800000) {
    // less than 18 hours
    return utcHour.every(1)
  }
  if (time <= 86400000) {
    // less than day
    return utcHour.every(4)
  }
  if (time <= 259200000) {
    // less than 3 days
    return utcHour.every(6)
  }
  if (time <= 432000000) {
    // less than 5 days
    return utcHour.every(12)
  }
  if (time <= 604800000) {
    // less than 7 days
    return utcDay.every(1)
  }
  // return timeMonday.every(1)
}
