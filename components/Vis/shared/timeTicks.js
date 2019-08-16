import {
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeWeek,
  timeMonth,
  timeMonday,
  timeYear
} from 'd3-time'

export default function(time) {
  if (time <= 64800000) {
    // less than 18 hours
    return timeHour.every(1)
  }
  if (time <= 86400000) {
    // less than day
    return timeHour.every(4)
  }
  if (time <= 259200000) {
    // less than 3 days
    return timeHour.every(6)
  }
  if (time <= 432000000) {
    // less than 5 days
    return timeHour.every(12)
  }
  if (time <= 604800000) {
    // less than 7 days
    return timeDay.every(1)
  }
  // return timeMonday.every(1)
}
