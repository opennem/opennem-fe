import parseISO from 'date-fns/parseISO'
import addDays from 'date-fns/addDays'
import addWeeks from 'date-fns/addWeeks'
import addMonths from 'date-fns/addMonths'
import addQuarters from 'date-fns/addQuarters'
import addYears from 'date-fns/addYears'
import { getTimezoneOffset } from 'date-fns-tz'

import {
  INTERVAL_DAY,
  INTERVAL_WEEK,
  INTERVAL_MONTH,
  INTERVAL_SEASON,
  INTERVAL_QUARTER,
  INTERVAL_HALFYEAR,
  INTERVAL_FINYEAR,
  INTERVAL_YEAR
} from '@/constants/interval-filters.js'

export const getNextDateByInterval = (date, interval, isFiltered) => {
  switch (interval) {
    case INTERVAL_DAY:
      return addDays(date, 1)
    case INTERVAL_WEEK:
      return addWeeks(date, 1)
    case INTERVAL_MONTH:
      return isFiltered ? addYears(date, 1) : addMonths(date, 1)
    case INTERVAL_SEASON:
      return isFiltered ? addYears(date, 1) : addMonths(date, 3)
    case INTERVAL_QUARTER:
      return isFiltered ? addYears(date, 1) : addQuarters(date, 1)
    case INTERVAL_HALFYEAR:
      return isFiltered ? addYears(date, 1) : addMonths(date, 6)
    case INTERVAL_FINYEAR:
    case INTERVAL_YEAR:
      return addYears(date, 1)
    default:
      return date
  }
}

export const mutateDate = (dateString, displayTzOffset, ignoreTime) => {
  // whether to strip out the time in dateString
  const end = ignoreTime ? 10 : 16
  const append = ignoreTime ? '' : '+00:00'

  // get original offset in milliseconds from the datestring (i.e., +10:00 in milliseconds)
  const dataTzOffset = getTimezoneOffset(
    dateString.substring(dateString.indexOf('+'), dateString.length)
  )

  // modify datestring so the datetime is parsed as utc
  const stripped = dateString.substring(0, end) + append

  const date = parseISO(stripped)

  // change the time to match the timezone you want to display on the app
  const updatedTime = date.getTime() - dataTzOffset + displayTzOffset

  // get the new date
  const updatedDate = new Date(updatedTime)

  return updatedDate
}
