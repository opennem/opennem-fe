import subDays from 'date-fns/subDays'

export default {
  getEnergyUrls(region, range) {
    const prepend =
      region === 'wem' || region === 'nem' || region === 'au' ? '' : '/NEM'
    const regionId = region.toUpperCase()
    const thisFullYear = new Date().getFullYear()
    let lastFullYear = null
    const urls = []

    switch (range) {
      case '1D':
      case '3D':
      case '7D':
        urls.push(`v3/stats/au${prepend}/${regionId}/power/7d.json`)
        break
      case '30D':
        const thirtyDaysAgo = subDays(new Date(), 30)
        lastFullYear = thirtyDaysAgo.getFullYear()

        if (thisFullYear !== lastFullYear) {
          urls.push(
            `v3/stats/au${prepend}/${regionId}/energy/${lastFullYear}.json`
          )
        }

        urls.push(
          `v3/stats/au${prepend}/${regionId}/energy/${thisFullYear}.json`
        )
        break
      case '1Y':
        const now = new Date().getTime()
        const aYearAgo = now - 31557600000
        lastFullYear = new Date(aYearAgo).getFullYear()

        if (thisFullYear !== lastFullYear) {
          urls.push(
            `v3/stats/au${prepend}/${regionId}/energy/${lastFullYear}.json`
          )
        }

        urls.push(
          `v3/stats/au${prepend}/${regionId}/energy/${thisFullYear}.json`
        )
        break
      case 'ALL':
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
