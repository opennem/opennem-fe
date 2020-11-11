function getPrependString(region, prod) {
  let string = ''
  string = prod ? '/' : '/testing/v2/'

  if (region === 'wem') {
    string = '/'
  }
  return string
}

export default {
  getEnergyUrls(region, range, hostEnv) {
    const prod = hostEnv === 'prod'
    const prependString = getPrependString(region, prod)
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
            urls.push(`v3/stats/au/${region.toUpperCase()}/power/7d.json`)
          }
        }
        break
      case '30D':
        if (prod) {
          urls.push(
            `${prependString}${region}/energy/daily/${thisFullYear}.json`
          )
        } else {
          urls.push(
            `v3/stats/au/${region.toUpperCase()}/energy/${thisFullYear}.json`
          )
        }
        break
      case '1Y':
        const now = new Date().getTime()
        const aYearAgo = now - 31557600000
        const lastFullYear = new Date(aYearAgo).getFullYear()

        if (thisFullYear !== lastFullYear) {
          if (prod) {
            urls.push(
              `${prependString}${region}/energy/daily/${lastFullYear}.json`
            )
          } else {
            urls.push(
              `v3/stats/au/${region.toUpperCase()}/energy/${lastFullYear}.json`
            )
          }
        }

        if (prod) {
          urls.push(
            `${prependString}${region}/energy/daily/${thisFullYear}.json`
          )
        } else {
          urls.push(
            `v3/stats/au/${region.toUpperCase()}/energy/${thisFullYear}.json`
          )
        }

        break
      case 'ALL':
        if (prod) {
          urls.push(`${prependString}${region}/energy/monthly/all.json`)
        } else {
          urls.push(`v3/stats/au/${region.toUpperCase()}/energy/all.json`)
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
        return 'P'
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
