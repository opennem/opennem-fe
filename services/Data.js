import subDays from 'date-fns/subDays'
import subYears from 'date-fns/subYears'

import {
  RANGE_1D,
  RANGE_3D,
  RANGE_7D,
  RANGE_30D,
  RANGE_1Y,
  RANGE_ALL,
  RANGE_ALL_12MTH_ROLLING
} from '~/constants/ranges.js'

export default {
  getEnergyUrls(region, range) {
    const prepend =
      region === 'wem' || region === 'nem' || region === 'au' ? '' : '/NEM'
    const regionId = region.toUpperCase()
    const thisFullYear = new Date().getFullYear()
    let oneYearAgo = null
    const urls = []

    switch (range) {
      case RANGE_1D:
      case RANGE_3D:
      case RANGE_7D:
        urls.push(`v3/stats/au${prepend}/${regionId}/power/7d.json`)
        break
      case RANGE_30D:
        const thirtyDaysAgo = subDays(new Date(), 30)
        oneYearAgo = thirtyDaysAgo.getFullYear()

        if (thisFullYear !== oneYearAgo) {
          urls.push(
            `v3/stats/au${prepend}/${regionId}/energy/${oneYearAgo}.json`
          )
        }

        urls.push(
          `v3/stats/au${prepend}/${regionId}/energy/${thisFullYear}.json`
        )
        break
      case RANGE_1Y:
        oneYearAgo = subYears(new Date(), 1).getFullYear()

        if (thisFullYear !== oneYearAgo) {
          urls.push(
            `v3/stats/au${prepend}/${regionId}/energy/${oneYearAgo}.json`
          )
        }

        urls.push(
          `v3/stats/au${prepend}/${regionId}/energy/${thisFullYear}.json`
        )
        break

      case RANGE_ALL:
      case RANGE_ALL_12MTH_ROLLING:
        urls.push(`v3/stats/au${prepend}/${regionId}/energy/all.json`)
        break
      default:
    }
    return urls
  },

  getYearDailyPath(region, year, useV3Paths) {
    const prepend =
      region === 'wem' || region === 'nem' || region === 'au' ? '' : '/NEM'
    const regionId = region.toUpperCase()

    return `v3/stats/au${prepend}/${regionId}/energy/${year}.json`
  },

  getRegionAllDailyPath(region) {
    // const prepend =
    //   region === 'wem' || region === 'nem' || region === 'au' ? '' : '/NEM'
    const regionId = region.toUpperCase()
    return `v3/stats/au/${regionId}/daily.json`
  },

  getAllMonthlyPath() {
    return 'v3/stats/au/all/monthly.json'
  }
}
