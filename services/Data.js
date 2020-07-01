export default {
  getEnergyUrls(region, range, hostEnv) {
    const prepend = hostEnv === 'dev' ? '/testing' : ''
    let isProd = hostEnv === 'prod'
    isProd = true
    const thisFullYear = new Date().getFullYear()
    const urls = []
    switch (range) {
      case '1D':
      case '3D':
      case '7D':
        if (isProd) {
          urls.push(`/power/${region}.json`)
        } else {
          urls.push(`/testing/v2/${region}/power/5min/live.json`)
        }
        break
      case '30D':
        if (isProd) {
          urls.push(`/testing/${region}/energy/daily/${thisFullYear}.json`)
        } else {
          urls.push(`/testing/v2/${region}/energy/daily/${thisFullYear}.json`)
        }
        break
      case '1Y':
        const now = new Date().getTime()
        const aYearAgo = now - 31557600000
        const lastFullYear = new Date(aYearAgo).getFullYear()

        if (thisFullYear !== lastFullYear) {
          if (isProd) {
            urls.push(`/testing/${region}/energy/daily/${lastFullYear}.json`)
          } else {
            urls.push(`/testing/v2/${region}/energy/daily/${lastFullYear}.json`)
          }
        }

        if (isProd) {
          urls.push(`/testing/${region}/energy/daily/${thisFullYear}.json`)
        } else {
          urls.push(`/testing/v2/${region}/energy/daily/${thisFullYear}.json`)
        }
        break
      case 'ALL':
        if (isProd) {
          urls.push(`${prepend}/${region}/energy/monthly/all.json`)
        } else {
          urls.push(`/testing/v2/${region}/energy/monthly/all.json`)
        }
        break
      default:
    }
    return urls
  },

  siPreviousPrefix(prefix) {
    switch (prefix) {
      case 'k':
        return ''
      case 'M':
        return 'k'
      case 'G':
        return 'M'
      case 'T':
        return 'G'
      default:
        return ''
    }
  },

  siNextPrefix(prefix) {
    switch (prefix) {
      case 'k':
        return 'M'
      case 'M':
        return 'G'
      case 'G':
        return 'T'
      case 'T':
        return ''
      default:
        return 'k'
    }
  },

  siCalculationFromBase(prefix, currentValue) {
    switch (prefix) {
      case 'k':
        return currentValue / Math.pow(10, 3)
      case 'M':
        return currentValue / Math.pow(10, 6)
      case 'G':
        return currentValue / Math.pow(10, 9)
      case 'T':
        return currentValue / Math.pow(10, 12)
      default:
        return currentValue
    }
  },

  siCalculationToBase(prefix, currentValue) {
    switch (prefix) {
      case 'k':
        return currentValue * Math.pow(10, 3)
      case 'M':
        return currentValue * Math.pow(10, 6)
      case 'G':
        return currentValue * Math.pow(10, 9)
      case 'T':
        return currentValue * Math.pow(10, 12)
      default:
        return currentValue
    }
  }
}
