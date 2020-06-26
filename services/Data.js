function getPrependString(region, range, prod) {
  let string = ''
  string = prod ? '/' : '/testing/v2/'

  if (prod && (range === '30D' || range === '1Y')) {
    string = '/testing/'
  }
  if (region === 'wem') {
    string = '/'
  }
  return string
}

export default {
  getEnergyUrls(region, range, hostEnv) {
    const prod = hostEnv === 'prod'
    const prependString = getPrependString(region, range, prod)
    console.log(prependString)

    let prepend = hostEnv === 'dev' ? '/testing' : ''
    let isProd = hostEnv === 'prod'

    const thisFullYear = new Date().getFullYear()
    const urls = []

    switch (range) {
      case '1D':
      case '3D':
      case '7D':
        if (prod) {
          urls.push(`/power/${region}.json`)
        } else {
          if (region === 'wem') {
            urls.push(`/power/${region}.json`)
          } else {
            urls.push(`${prependString}${region}/power/5min/live.json`)
          }
        }
        break
      case '30D':
        urls.push(`${prependString}${region}/energy/daily/${thisFullYear}.json`)
        break
      case '1Y':
        const now = new Date().getTime()
        const aYearAgo = now - 31557600000
        const lastFullYear = new Date(aYearAgo).getFullYear()

        if (thisFullYear !== lastFullYear) {
          urls.push(
            `${prependString}${region}/energy/daily/${lastFullYear}.json`
          )
        }

        urls.push(`${prependString}${region}/energy/daily/${thisFullYear}.json`)
        break
      case 'ALL':
        urls.push(`${prependString}${region}/energy/monthly/all.json`)
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
