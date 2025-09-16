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

export default function (range, interval, isZoomed, filterPeriod, mobileScreen, filteredDates) {
  if (range === '3D') {
    if (isZoomed) return null
    return utcDay.every(1)
  }
  if (range === '7D') {
    if (isZoomed) return null
    return utcDay.every(1)
  }
  if (range === '30D') {
    if (isZoomed) return timeMonday.every(0.5)
    return timeMonday.every(mobileScreen ? 1 : 0.5)
  }
  if (range === '1Y') {
    if (interval === 'Day') {
      if (isZoomed) return timeMonday.every(1)
      return timeMonday.every(mobileScreen ? 8 : 4)
    }
    if (interval === 'Week') {
      if (isZoomed) return timeMonday.every(1)
      return timeMonday.every(mobileScreen ? 8 : 4)
    }
    if (interval === 'Month') {
      if (isZoomed) return timeMonth.every(1)
      return timeMonth.every(mobileScreen ? 2 : 1)
    }
  }
  if (range === 'ALL') {
    const isFilter = !filterPeriod || filterPeriod !== 'All'
    const hasFilters = hasIntervalFilters(interval)

    if (
      interval === INTERVAL_SEASON
    ) {
      if (isFilter) {
        if (filterPeriod === 'Summer') {
          if (isZoomed) {
            // if the difference of the dates is less than 5 years
            const diff = filteredDates[1].getTime() - filteredDates[0].getTime()
            if (diff < 5 * 365 * 24 * 60 * 60 * 1000) {
              return timeMonth.filter((d) => d.getMonth() === 11)
            } 
          }
          return timeMonth.filter((d) => d.getMonth() === 11 && d.getFullYear() % 3 === 0)
        }
        if (filterPeriod === 'Autumn') {
          if (isZoomed) {
            return timeMonth.filter((d) => d.getMonth() === 2)
          }
          return timeMonth.filter((d) => d.getMonth() === 2 && d.getFullYear() % 3 === 0)
        }
        if (filterPeriod === 'Winter') {
          if (isZoomed) {
            return timeMonth.filter((d) => d.getMonth() === 5)
          }
          return timeMonth.filter((d) => d.getMonth() === 5 && d.getFullYear() % 3 === 0)
        }
        if (filterPeriod === 'Spring') {  
          if (isZoomed) {
            return timeMonth.filter((d) => d.getMonth() === 8)
          }
          return timeMonth.filter((d) => d.getMonth() === 8 && d.getFullYear() % 3 === 0)
        }
      }

      if (isZoomed) {
        if (filteredDates && filteredDates.length > 0) {
        // if the difference of the dates is less than 5 years
        const diff = filteredDates[1].getTime() - filteredDates[0].getTime()
        if (diff < 5 * 365 * 24 * 60 * 60 * 1000) {
          return timeMonth.filter((d) => d.getMonth() === 11 || d.getMonth() === 2 || d.getMonth() === 5 || d.getMonth() === 8)
        } 
      }

        return timeMonth.filter((d) => {
          return d.getMonth() === 11 
        })
      }
      return timeMonth.filter((d) => d.getMonth() === 11 && d.getFullYear() % 3 === 0)
    }

    if (
      interval === INTERVAL_QUARTER
    ) {
      if (isZoomed) {
        if (filteredDates && filteredDates.length > 0) {
          // if the difference of the dates is less than 5 years
          const diff = filteredDates[1].getTime() - filteredDates[0].getTime()
          if (diff < 5 * 365 * 24 * 60 * 60 * 1000) {
            return timeMonth.filter((d) => d.getMonth() === 0 || d.getMonth() === 3 || d.getMonth() === 6 || d.getMonth() === 9)
          }    
        }

        return timeMonth.filter((d) => {
          return d.getMonth() === 0 
        })
      }
      return timeMonth.filter((d) => d.getMonth() === 0 && d.getFullYear() % 2 === 0)
    }

    if (
      interval === INTERVAL_HALFYEAR
    ) {
      const periodMonth = DateDisplay.getPeriodMonth(filterPeriod)
      if (isFilter && periodMonth) {
        return timeMonth.filter((d) => d.getMonth() === periodMonth)
      }
    }

    if (interval === 'Fin Year') {
      if (isZoomed) {
        return timeMonth.filter((d) => d.getMonth() === 6)
      }
      return timeMonth.filter((d) => d.getMonth() === 6 && d.getFullYear() % 2 === 0)
    }

    if (isZoomed) {
      return null
    }

    return null

    // return timeYear.every(mobileScreen ? 2 : 2)
  }
  if (range === '12 Mth Rolling') {
    return timeYear.every(mobileScreen ? 2 : 1)
  }
  return null
}
