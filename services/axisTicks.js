import {
  timeDay,
  timeMonday,
  timeMonth,
  timeYear,
  utcDay,
  utcHour
} from 'd3-time'
import DateDisplay from '@/services/DateDisplay.js'
import {
  INTERVAL_5MIN,
  INTERVAL_30MIN,
  INTERVAL_DAY,
  INTERVAL_WEEK,
  INTERVAL_MONTH,
  INTERVAL_SEASON,
  INTERVAL_QUARTER,
  INTERVAL_HALFYEAR,
  INTERVAL_FINYEAR,
  INTERVAL_YEAR,
  hasIntervalFilters
} from '@/constants/interval-filters.js'

export default function(range, interval, isZoomed, filterPeriod) {
  if (range === '3D') {
    return utcDay.every(0.5)
  }
  if (range === '7D') {
    if (isZoomed) return utcHour.every(6)
    return utcDay.every(1)
  }
  if (range === '30D') {
    if (isZoomed) {
      return timeDay.every(1)
    }
    return timeDay.every(0.5)
  }
  if (range === '1Y') {
    if (interval === 'Day') {
      if (isZoomed) {
        return null
      }
      return timeMonth.every(1)
    }
    if (interval === 'Week') {
      if (isZoomed) {
        return null
      }
      return timeMonday.every(4)
    }
    if (interval === 'Month') {
      return timeMonth.every(1)
    }
  }
  if (range === 'ALL') {
    const isFilter = !filterPeriod || filterPeriod !== 'All'
    const hasFilters = hasIntervalFilters(interval)

    if (
      interval === INTERVAL_SEASON ||
      interval === INTERVAL_QUARTER ||
      interval === INTERVAL_HALFYEAR
    ) {
      const periodMonth = DateDisplay.getPeriodMonth(filterPeriod)
      if (isFilter && periodMonth) {
        return timeMonth.filter(d => d.getMonth() === periodMonth)
      }
    }

    if (interval === 'Fin Year') {
      return timeMonth.filter(d => d.getMonth() === 6)
    }

    if (isZoomed) {
      return null
    }

    return timeYear.every(1)
  }
  return null
}
