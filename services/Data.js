export default {
  getEnergyUrls(region, range, useV3Paths) {
    const prepend = region === 'wem' || region === 'nem' ? '' : '/NEM'
    const thisFullYear = new Date().getFullYear()
    const urls = []

    switch (range) {
      case '1D':
      case '3D':
      case '7D':
        if (useV3Paths || region === 'wem') {
          urls.push(
            `v3/stats/au${prepend}/${region.toUpperCase()}/power/7d.json`
          )
        } else {
          urls.push(`power/${region}.json`)
        }
        break
      case '30D':
        if (useV3Paths || region === 'wem') {
          urls.push(
            `v3/stats/au${prepend}/${region.toUpperCase()}/energy/${thisFullYear}.json`
          )
        } else {
          urls.push(`${region}/energy/daily/${thisFullYear}.json`)
        }
        break
      case '1Y':
        const now = new Date().getTime()
        const aYearAgo = now - 31557600000
        const lastFullYear = new Date(aYearAgo).getFullYear()

        if (thisFullYear !== lastFullYear) {
          if (useV3Paths || region === 'wem') {
            urls.push(
              `v3/stats/au${prepend}/${region.toUpperCase()}/energy/${lastFullYear}.json`
            )
          } else {
            urls.push(`${region}/energy/daily/${lastFullYear}.json`)
          }
        }

        if (useV3Paths || region === 'wem') {
          urls.push(
            `v3/stats/au${prepend}/${region.toUpperCase()}/energy/${thisFullYear}.json`
          )
        } else {
          urls.push(`${region}/energy/daily/${thisFullYear}.json`)
        }

        break
      case 'ALL':
        if (useV3Paths || region === 'wem') {
          urls.push(
            `v3/stats/au${prepend}/${region.toUpperCase()}/energy/all.json`
          )
        } else {
          urls.push(`${region}/energy/monthly/all.json`)
        }
        break
      default:
    }
    return urls
  },

  getYearDailyPath(region, year, useV3Paths) {
    const prepend = region === 'wem' || region === 'nem' ? '' : '/NEM'
    if (useV3Paths || region === 'wem') {
      return `v3/stats/au${prepend}/${region.toUpperCase()}/energy/${year}.json`
    }
    return `${region}/energy/daily/${year}.json`
  }
}
