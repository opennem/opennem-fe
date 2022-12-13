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
import DateDisplay from '~/services/DateDisplay.js'

export function onBrush({ s, x, interval, filterPeriod }) {
  let startX = x.invert(s[0])
  let endX = x.invert(s[1])

  if (interval === INTERVAL_FINYEAR) {
    if (startX.getMonth() >= 6) {
      startX.setFullYear(startX.getFullYear() + 1)
    }
    if (endX.getMonth() >= 6) {
      endX.setFullYear(endX.getFullYear() + 1)
    }
  }

  const isFilter = !filterPeriod || filterPeriod !== 'All'
  if (isFilter && hasIntervalFilters(interval)) {
    const periodMonth = DateDisplay.getPeriodMonth(filterPeriod)
    const startXMonth = startX.getMonth()
    const endXMonth = endX.getMonth()

    if (interval === INTERVAL_MONTH) {
      startX = DateDisplay.mutateMonthDate(startX, startXMonth, filterPeriod)
      endX = DateDisplay.mutateMonthDate(endX, endXMonth, filterPeriod)
    } else if (interval === INTERVAL_SEASON) {
      startX = DateDisplay.mutateSeasonDate(startX, startXMonth, filterPeriod)
      endX = DateDisplay.mutateSeasonDate(endX, endXMonth, filterPeriod)
    } else if (interval === INTERVAL_QUARTER) {
      startX = DateDisplay.mutateQuarterDate(startX, startXMonth, filterPeriod)
      endX = DateDisplay.mutateQuarterDate(endX, endXMonth, filterPeriod)
    } else if (interval === INTERVAL_HALFYEAR) {
      startX = DateDisplay.mutateHalfYearDate(startX, startXMonth, filterPeriod)
      endX = DateDisplay.mutateHalfYearDate(endX, endXMonth, filterPeriod)
    }

    if (interval === INTERVAL_MONTH) {
      startX.setMonth(periodMonth)
      endX.setMonth(periodMonth)
    } else {
      startX.setMonth(periodMonth + 1)
      endX.setMonth(periodMonth + 1)
    }
  }

  const startTime = DateDisplay.roundToClosestInterval(
    interval,
    filterPeriod,
    startX,
    'floor'
  )
  const endTime = DateDisplay.roundToClosestInterval(
    interval,
    filterPeriod,
    endX,
    'ceil'
  )

  return [startTime, endTime]
}

export function onBrushEnded({ s, x, interval, filterPeriod, datasetEndDate }) {
  let startX = x.invert(s[0])
  let endX = x.invert(s[1])

  if (interval === INTERVAL_FINYEAR) {
    if (startX.getMonth() >= 6) {
      startX.setFullYear(startX.getFullYear() + 1)
    }
    if (endX.getMonth() >= 6) {
      endX.setFullYear(endX.getFullYear() + 1)
    }
  }

  const isFilter = !filterPeriod || filterPeriod !== 'All'
  if (isFilter && hasIntervalFilters(interval)) {
    const periodMonth = DateDisplay.getPeriodMonth(filterPeriod)
    const startXMonth = startX.getMonth()
    const endXMonth = endX.getMonth()

    if (interval === INTERVAL_MONTH) {
      startX = DateDisplay.mutateMonthDate(startX, startXMonth, filterPeriod)
      endX = DateDisplay.mutateMonthDate(endX, endXMonth, filterPeriod)
    } else if (interval === INTERVAL_SEASON) {
      startX = DateDisplay.mutateSeasonDate(startX, startXMonth, filterPeriod)
      endX = DateDisplay.mutateSeasonDate(endX, endXMonth, filterPeriod)
    } else if (interval === INTERVAL_QUARTER) {
      startX = DateDisplay.mutateQuarterDate(startX, startXMonth, filterPeriod)
      endX = DateDisplay.mutateQuarterDate(endX, endXMonth, filterPeriod)
    } else if (interval === INTERVAL_HALFYEAR) {
      startX = DateDisplay.mutateHalfYearDate(startX, startXMonth, filterPeriod)
      endX = DateDisplay.mutateHalfYearDate(endX, endXMonth, filterPeriod)
    }

    if (interval === INTERVAL_MONTH) {
      startX.setMonth(periodMonth)
      endX.setMonth(periodMonth)
    } else {
      startX.setMonth(periodMonth + 1)
      endX.setMonth(periodMonth + 1)
    }
  }

  const startTime = DateDisplay.roundToClosestInterval(
    interval,
    filterPeriod,
    startX,
    'floor'
  )
  const endTime = DateDisplay.roundToClosestInterval(
    interval,
    filterPeriod,
    endX,
    'ceil'
  )

  return isFilter
    ? getZoomDateRanges({ datasetEndDate, interval, startX, endX })
    : [startTime, endTime]
}

function getZoomDateRanges({ datasetEndDate, interval, startX, endX }) {
  let start = startX
  let end = endX
  const duration = endX - startX
  let limit = 0

  function checkWithZoomLimits(limit) {
    if (duration < limit) {
      const newEnd = new Date(startX).getTime() + limit
      const datasetEndTime = new Date(datasetEndDate).getTime()

      if (newEnd > datasetEndTime) {
        start = new Date(datasetEndTime - limit)
        end = datasetEndDate
      } else {
        end = new Date(newEnd)
      }
    }

    return [start, end]
  }

  // Limit the zoom level based on interval
  switch (interval) {
    case INTERVAL_5MIN:
    case INTERVAL_30MIN:
      limit = 14400000
      break
    case INTERVAL_DAY:
      limit = 345600000
      break
    case INTERVAL_WEEK:
      limit = 2419200000
      break
    case INTERVAL_MONTH:
      limit = 10519200000
      break
    case INTERVAL_SEASON:
    case INTERVAL_QUARTER:
    case INTERVAL_HALFYEAR:
      limit = 23668200000
      break
    case INTERVAL_YEAR:
    case INTERVAL_YEAR:
      limit = 126230400000
      break
  }

  return checkWithZoomLimits(limit)
}
