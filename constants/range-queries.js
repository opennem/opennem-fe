import _includes from 'lodash.includes'
import * as RANGES from '@/constants/ranges.js'

export const RANGE_QUERY_1D = '1d'
export const RANGE_QUERY_3D = '3d'
export const RANGE_QUERY_7D = '7d'
export const RANGE_QUERY_30D = '30d'
export const RANGE_QUERY_1Y = '1y'
export const RANGE_QUERY_ALL = 'all'

export const RANGE_QUERIES = {}
RANGE_QUERIES[RANGE_QUERY_1D] = RANGES.RANGE_1D
RANGE_QUERIES[RANGE_QUERY_3D] = RANGES.RANGE_3D
RANGE_QUERIES[RANGE_QUERY_7D] = RANGES.RANGE_7D
RANGE_QUERIES[RANGE_QUERY_30D] = RANGES.RANGE_30D
RANGE_QUERIES[RANGE_QUERY_1Y] = RANGES.RANGE_1Y
RANGE_QUERIES[RANGE_QUERY_ALL] = RANGES.RANGE_ALL

const rangeQueries = Object.keys(RANGE_QUERIES)

export function isValidRangeQuery(query) {
  return _includes(rangeQueries, query)
}
