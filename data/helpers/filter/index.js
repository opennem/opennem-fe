import subDays from 'date-fns/subDays'
import subMonths from 'date-fns/subMonths'
import {
  RANGE_1D,
  RANGE_3D,
  RANGE_7D,
  RANGE_30D,
  RANGE_1Y,
  RANGE_1Y_12MTH_ROLLING,
  RANGE_ALL,
  RANGE_ALL_12MTH_ROLLING
} from '@/constants/ranges.js'
import DateDisplay from '@/services/DateDisplay.js'

export function filterDatasetByRange(dataset, range) {
  if (
    range === RANGE_7D ||
    range === RANGE_ALL ||
    range === RANGE_ALL_12MTH_ROLLING
  ) {
    return dataset // no need to filter
  }

  const latestDate = dataset[dataset.length - 1]
    ? dataset[dataset.length - 1].date
    : null

  if (latestDate) {
    let newStartDate = null
    if (range === RANGE_1D) {
      newStartDate = subDays(latestDate, 1)
    } else if (range === RANGE_3D) {
      newStartDate = subDays(latestDate, 3)
    } else if (range === RANGE_30D) {
      newStartDate = subDays(latestDate, 29)
    } else if (range === RANGE_1Y || range === RANGE_1Y_12MTH_ROLLING) {
      newStartDate = subMonths(latestDate, 12)
    }
    return dataset.filter(d => d.date >= newStartDate && d.date <= latestDate)
  }

  return dataset
}

export function filterDatasetByPeriod(dataset, interval, period) {
  if (period === 'All') {
    return dataset
  }
  const month = DateDisplay.getPeriodMonth(period)
  return dataset.filter(d => {
    const dMonth = d.date.getMonth()
    return dMonth === month
  })
}
