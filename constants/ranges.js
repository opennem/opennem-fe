import * as INTERVALS from '@/constants/interval-filters.js'

export const RANGE_1D = '1D'
export const RANGE_3D = '3D'
export const RANGE_7D = '7D'
export const RANGE_30D = '30D'
export const RANGE_1Y = '1Y'
export const RANGE_ALL = 'ALL'

export function isPowerRange(range) {
  return range === RANGE_1D || range === RANGE_3D || range === RANGE_7D
}

export const FuelTechRanges = [
  {
    range: RANGE_1D,
    intervals: [INTERVALS.INTERVAL_5MIN, INTERVALS.INTERVAL_30MIN]
  },
  {
    range: RANGE_3D,
    intervals: [INTERVALS.INTERVAL_5MIN, INTERVALS.INTERVAL_30MIN]
  },
  {
    range: RANGE_7D,
    intervals: [INTERVALS.INTERVAL_5MIN, INTERVALS.INTERVAL_30MIN]
  },
  {
    range: RANGE_30D,
    intervals: [INTERVALS.INTERVAL_DAY]
  },
  {
    range: RANGE_1Y,
    intervals: [
      INTERVALS.INTERVAL_DAY,
      INTERVALS.INTERVAL_WEEK,
      INTERVALS.INTERVAL_MONTH
    ]
  },
  {
    range: RANGE_ALL,
    intervals: [
      INTERVALS.INTERVAL_MONTH,
      INTERVALS.INTERVAL_SEASON,
      INTERVALS.INTERVAL_QUARTER,
      INTERVALS.INTERVAL_HALFYEAR,
      INTERVALS.INTERVAL_FINYEAR,
      INTERVALS.INTERVAL_YEAR
    ]
  }
]

export const FacilityPowerEnergyRanges = [
  {
    range: RANGE_1D,
    intervals: [INTERVALS.INTERVAL_5MIN, INTERVALS.INTERVAL_30MIN]
  },
  {
    range: RANGE_3D,
    intervals: [INTERVALS.INTERVAL_5MIN, INTERVALS.INTERVAL_30MIN]
  },
  {
    range: RANGE_7D,
    intervals: [INTERVALS.INTERVAL_5MIN, INTERVALS.INTERVAL_30MIN]
  },
  {
    range: RANGE_30D,
    intervals: [INTERVALS.INTERVAL_DAY]
  },
  {
    range: RANGE_1Y,
    intervals: [
      INTERVALS.INTERVAL_DAY,
      INTERVALS.INTERVAL_WEEK,
      INTERVALS.INTERVAL_MONTH
    ]
  },
  {
    range: RANGE_ALL,
    intervals: [INTERVALS.INTERVAL_MONTH]
  }
]
