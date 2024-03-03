import subDays from 'date-fns/subDays'
import subYears from 'date-fns/subYears'

import * as rangesJs from '~/constants/ranges.js'
import { INTERVAL_5MIN, INTERVAL_30MIN } from '~/constants/interval-filters.js'

const version = 'v4'

function getYearPaths(prepend, regionId, oneYearAgo) {
  const today = new Date()
  const thisFullYear = today.getFullYear()
  const thisDate = today.getDate()
  const thisMonth = today.getMonth()

  const paths = []
  const is1Jan = thisDate === 1 && thisMonth === 0

  if (thisFullYear !== oneYearAgo) {
    paths.push(`${version}/stats/au${prepend}/${regionId}/energy/${oneYearAgo}.json`)
  }

  // check it's not 1/1/yyyy since the new year won't be generated yet
  if (!is1Jan) {
    paths.push(`${version}/stats/au${prepend}/${regionId}/energy/${thisFullYear}.json`)
  }

  return paths
}

export default {
  getEnergyUrls(region, range, interval) {
    const prepend =
      region === 'wem' || region === 'nem' || region === 'au' ? '' : '/NEM'
    const regionId = region.toUpperCase()
    let oneYearAgo = null
    let urls = []

    switch (range) {
      case rangesJs.RANGE_1D:
      case rangesJs.RANGE_3D:
      case rangesJs.RANGE_7D:
        urls.push(`${version}/stats/au${prepend}/${regionId}/power/7d.json`)
        break

      case rangesJs.RANGE_14D:
      case rangesJs.RANGE_28D:
        urls.push(`${version}/stats/au${prepend}/${regionId}/power/30d.json`)
        break

      case rangesJs.RANGE_30D:
        if (interval === INTERVAL_5MIN || interval === INTERVAL_30MIN) {
          urls.push(`${version}/stats/au${prepend}/${regionId}/power/30d.json`)
        } else {
          const thirtyDaysAgo = subDays(new Date(), 30)
          oneYearAgo = thirtyDaysAgo.getFullYear()
          urls = getYearPaths(prepend, regionId, oneYearAgo)
        }
        break

      case rangesJs.RANGE_1Y:
        oneYearAgo = subYears(new Date(), 1).getFullYear()
        urls = getYearPaths(prepend, regionId, oneYearAgo)
        break

      case rangesJs.RANGE_ALL:
      case rangesJs.RANGE_ALL_12MTH_ROLLING:
        urls.push(`${version}/stats/au${prepend}/${regionId}/energy/all.json`)
        break
      default:
    }
    return urls
  },

  getTimeOfDayUrls(region, range) {
    const prepend =
      region === 'wem' || region === 'nem' || region === 'au' ? '' : '/NEM'
    const regionId = region.toUpperCase()
    let urls = []

    switch (range) {
      case rangesJs.RANGE_7D:
      case rangesJs.RANGE_14D:
      case rangesJs.RANGE_28D:
        urls.push(`${version}/stats/au${prepend}/${regionId}/power/30d.json`)
        break
      default:
    }
    return urls
  },

  getYearDailyPath(region, year, useV3Paths) {
    const prepend =
      region === 'wem' || region === 'nem' || region === 'au' ? '' : '/NEM'
    const regionId = region.toUpperCase()

    return `${version}/stats/au${prepend}/${regionId}/energy/${year}.json`
  },

  getRegionAllDailyPath(region) {
    // const prepend =
    //   region === 'wem' || region === 'nem' || region === 'au' ? '' : '/NEM'
    const regionId = region.toUpperCase()
    return `${version}/stats/au/${regionId}/daily.json`
  },

  getAllMonthlyPath() {
    return `${version}/stats/au/all/monthly.json`
  }
}
