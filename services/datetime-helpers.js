import addWeeks from 'date-fns/addWeeks'
import addMonths from 'date-fns/addMonths'
import addQuarters from 'date-fns/addQuarters'
import addYears from 'date-fns/addYears'

import {
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
