import _includes from 'lodash.includes'
import * as INTERVALS from '@/constants/interval-filters.js'

export const INTERVAL_QUERY_5MIN = '5m'
export const INTERVAL_QUERY_30MIN = '30m'
export const INTERVAL_QUERY_DAY = '1d'
export const INTERVAL_QUERY_WEEK = '1w'
export const INTERVAL_QUERY_MONTH = '1M'
export const INTERVAL_QUERY_YEAR = '1y'

export const INTERVAL_QUERY_SEASON = 'season'
export const INTERVAL_QUERY_QUARTER = 'quarter'
export const INTERVAL_QUERY_HALFYEAR = 'half-year'
export const INTERVAL_QUERY_FINYEAR = 'fin-year'

export const INTERVAL_QUERIES = {}
INTERVAL_QUERIES[INTERVAL_QUERY_5MIN] = INTERVALS.INTERVAL_5MIN
INTERVAL_QUERIES[INTERVAL_QUERY_30MIN] = INTERVALS.INTERVAL_30MIN
INTERVAL_QUERIES[INTERVAL_QUERY_DAY] = INTERVALS.INTERVAL_DAY
INTERVAL_QUERIES[INTERVAL_QUERY_WEEK] = INTERVALS.INTERVAL_WEEK
INTERVAL_QUERIES[INTERVAL_QUERY_MONTH] = INTERVALS.INTERVAL_MONTH
INTERVAL_QUERIES[INTERVAL_QUERY_YEAR] = INTERVALS.INTERVAL_YEAR

// non standard
INTERVAL_QUERIES[INTERVAL_QUERY_SEASON] = INTERVALS.INTERVAL_SEASON
INTERVAL_QUERIES[INTERVAL_QUERY_QUARTER] = INTERVALS.INTERVAL_QUARTER
INTERVAL_QUERIES[INTERVAL_QUERY_HALFYEAR] = INTERVALS.INTERVAL_HALFYEAR
INTERVAL_QUERIES[INTERVAL_QUERY_FINYEAR] = INTERVALS.INTERVAL_FINYEAR

const DEFAULT_QUERY = INTERVAL_QUERY_30MIN

const intervalQueries = Object.keys(INTERVAL_QUERIES)

export function isValidIntervalQuery(query) {
  return _includes(intervalQueries, query)
}

export function getDefaultInterval() {
  return INTERVAL_QUERIES[DEFAULT_QUERY]
}

export function getIntervalQueryByInterval(interval) {
  const find = intervalQueries.find((iq) => INTERVAL_QUERIES[iq] === interval)
  return find ? find : DEFAULT_QUERY
}

export function getIntervalByIntervalQuery(query) {
  return INTERVAL_QUERIES[query] || INTERVAL_QUERIES[DEFAULT_QUERY]
}
