import _includes from 'lodash.includes'
import * as RANGES from '@/constants/ranges.js'

export const RANGE_QUERY_1D = '1d'
export const RANGE_QUERY_3D = '3d'
export const RANGE_QUERY_7D = '7d'
export const RANGE_QUERY_30D = '30d'
export const RANGE_QUERY_1Y = '1y'
export const RANGE_QUERY_1Y_12MTH_ROLLING = '1y-12-mth-rolling'
export const RANGE_QUERY_ALL = 'all'
export const RANGE_QUERY_ALL_12MTH_ROLLING = 'all-12-mth-rolling'

export const RANGE_QUERIES = {}
RANGE_QUERIES[RANGE_QUERY_1D] = RANGES.RANGE_1D
RANGE_QUERIES[RANGE_QUERY_3D] = RANGES.RANGE_3D
RANGE_QUERIES[RANGE_QUERY_7D] = RANGES.RANGE_7D
RANGE_QUERIES[RANGE_QUERY_30D] = RANGES.RANGE_30D
RANGE_QUERIES[RANGE_QUERY_1Y] = RANGES.RANGE_1Y
RANGE_QUERIES[RANGE_QUERY_1Y_12MTH_ROLLING] = RANGES.RANGE_1Y_12MTH_ROLLING
RANGE_QUERIES[RANGE_QUERY_ALL] = RANGES.RANGE_ALL
RANGE_QUERIES[RANGE_QUERY_ALL_12MTH_ROLLING] = RANGES.RANGE_ALL_12MTH_ROLLING

const DEFAULT_QUERY = RANGE_QUERY_7D

const rangeQueries = Object.keys(RANGE_QUERIES)

export function isValidRangeQuery(query) {
  return _includes(rangeQueries, query)
}

export function getDefaultRange() {
  return RANGE_QUERIES[DEFAULT_QUERY]
}

export function getRangeQueryByRange(range) {
  const find = rangeQueries.find(rq => RANGE_QUERIES[rq] === range)
  return find ? find : DEFAULT_QUERY
}

export function getRangeByRangeQuery(query) {
  return RANGE_QUERIES[query] || RANGE_QUERIES[DEFAULT_QUERY]
}
