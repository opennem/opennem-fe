import * as moment from 'moment'
import { FUEL_TECH } from './FuelTechConfig'

// TODO: refactor to data parasing code
// * map data using timestamp
// * check for highest res
// * note series with lower res
// * check lower res series and fill in values for each timestamp
// * note specific keys (all loads and imports) for changing values for stacking
// * should forecast data as seperate series for different chart styling?
export function generateChartData (data) {
  const container = {}
  const ftPriceIntervals = {}
  let shortestInterval = null

  // Find out what FT key (and price) is available in this dataset
  const keys = []
  Object.keys(FUEL_TECH).forEach(ftKey => {
    const find = data.find(d => d.fuel_tech === ftKey)
    const hasPrice = data.find(d => d.type === ftKey)
    if (find || hasPrice) {
      keys.push(ftKey)

      /** if there is a price key,
           create two more keys to split the positive and negative values of price
      **/
      if (hasPrice) {
        keys.push('pricePos')
        keys.push('priceNeg')
      }
    }
  })

  function createContainerObj (history, ftKey) {
    const startDate = history.start
    const seriesData = history.data

    let duration

    try {
      duration = parseInterval(history.interval)
    } catch (e) {
      console.error(e)
    }

    // store the shortest interval
    ftPriceIntervals[ftKey] = duration
    if (shortestInterval) {
      shortestInterval = compareAndGetShortestInterval(shortestInterval, duration, true)
    } else {
      shortestInterval = duration
    }

    const start = moment(startDate, moment.ISO_8601)

    for (let i = 0; i < seriesData.length; i++) {
      const now = moment(start).add(duration.value * i, duration.key)
      const d = (ftKey === 'exports' || ftKey === 'imports' || ftKey === 'pumps' || ftKey === 'battery_charging') ? -seriesData[i] : seriesData[i]
      const nowISO = moment(now).toISOString()

      if (!container[nowISO]) {
        container[nowISO] = {}

        keys.forEach(key => {
          container[nowISO][key] = null
        })
      }
      container[nowISO][ftKey] = d
    }
  }

  Object.keys(FUEL_TECH).forEach(ftKey => {
    const currentData = data.find(d => {
      return d.fuel_tech === ftKey
    })
    const price = data.find(d => d.type === ftKey)
    const history = currentData ? currentData['history'] : (price ? price['history'] : null)

    if (currentData || price) {
      createContainerObj(history, ftKey)

      if (currentData && currentData.forecast) {
        createContainerObj(currentData.forecast, ftKey)
      }
    }
  })

  const newChartData = []
  const longerIntervalSeries = []

  // Find out the series that has an interval longer than the shortest interval
  Object.keys(ftPriceIntervals).forEach(ftPrice => {
    if (!compareAndGetShortestInterval(ftPriceIntervals[ftPrice], shortestInterval, false)) {
      longerIntervalSeries.push({
        key: ftPrice,
        currentValue: null
      })
    }
  })

  Object.keys(container).forEach(dateKey => {
    const obj = Object.assign({}, container[dateKey])
    obj.date = moment(dateKey).toDate()

    // if there are longer interval series
    longerIntervalSeries.forEach(series => {
      const isPrice = series.key === 'price'

      if (obj[series.key] !== null) {
        series.currentValue = obj[series.key]
      } else if (obj[series.key] === null) {
        obj[series.key] = series.currentValue
      }

      if (isPrice) {
        obj['pricePos'] = obj[series.key] > 0 ? obj[series.key] : 0.1
        obj['priceNeg'] = obj[series.key] <= 0 ? -obj[series.key] : 0
      }  
    })

    newChartData.push(obj)
  })

  newChartData.sort((a, b) => {
    return moment(a.date).valueOf() - moment(b.date).valueOf()
  })

  return newChartData.slice(0)
}

/**
 * @param {*} chartData: {date, ft1, ft2, etc}
 * @param {*} start: start date
 * @param {*} end: end date
 *
 * Returns:
 * {
 *  sources: []
 *  loads: []
 * }
 *
 * Also calculates total power, total energy and average prices
 * - totals include NETINTERCHANGE data
 */
export function generateSummaryData (data, start, end) {

  // Check if it is a valid fuel tech name
  function isValidFT (name) {
    return name !== 'date' && name !== 'price' && name !== 'pricePos' && name !== 'priceNeg'
  }

  /** Get only data between the start and end dates **/
  // const filteredData = data.filter(item => {
  //   const d = moment(item.date)
  //   return d.isSameOrAfter(start) && d.isSameOrBefore(end)
  // })

  /** No zooming function, so just clone the data  */
  const filteredData = data.slice(0)

  if (filteredData[0]) {
    const allData = []
    const sourcesData = []
    const loadsData = []
    let totalPower = 0

    // create a new array with the ft totals
    const dataSum = filteredData.map((d, i) => {
      let p = 0
      Object.keys(d).forEach(ft => {
        if (isValidFT(ft)) {
          p += d[ft] || 0
        }
      })
      return p
    })

    // sum up all the ft totals
    const dataSumTotal = dataSum.reduce((a, b) => { return a + b }, 0)

    // calculate the price * total
    const dataSumTotalPrice = dataSum.map((d, i) => {
      const rrp = filteredData[i]['price'] ? filteredData[i]['price'] : 0
      return d * rrp
    })

    // calculate the total average price
    const totalAveragePrice = dataSumTotalPrice.reduce((a, b) => a + b, 0) / dataSumTotal

    Object.keys(filteredData[0]).forEach(ft => {

      if (isValidFT(ft)) {
        // sum up each ft total
        const totalFTPower = filteredData.reduce((a, b) => {
          return a + b[ft]
        }, 0)
        totalPower += totalFTPower

        // calculate the price * ft total
        const dataFTPrice = filteredData.map((d, i) => {
          const rrp = filteredData[i]['price'] ? filteredData[i]['price'] : 0
          return d[ft] * rrp
        })

        // calculate energy (GWh) += power * interval/60/100
        const dataEnergy = filteredData.map((d, i) => {
          return d[ft] * 5 / 60 / 1000
        })
        // sum the energy
        const energySum = dataEnergy.reduce((a, b) => a + b, 0)

        // calculate the ft average price
        const averageFTPrice = dataFTPrice.reduce((a, b) => a + b, 0) / totalFTPower
        const row = {
          id: ft,
          range: {
            totalPower: totalFTPower,
            energy: energySum, // same as totalFTPower / 12000
            averagePrice: averageFTPrice
          }
        }

        // TODO: use FUEL_TECH_CONFIG to check whether it is a load or type
        if (ft !== 'pumps' && ft !== 'exports' && ft !== 'battery_charging') {
          sourcesData.push(row)
        } else {
          loadsData.push(row)
        }
        allData.push(row)
        
      }
    })

    return {
      allData,
      sourcesData: sourcesData.reverse(), // to display from top to bottom in the table.
      loadsData,
      totalPower,
      totalAveragePrice
    }
  } else {
    return {
      sourcesData: [],
      loadsData: [],
      totalPower: 0,
      totalAveragePrice: 0
    }
  }
}

// TODO: deprecate this function
export function generatePriceData (chartSeries, payload) {
  const priceData = [].concat(chartSeries)
  const rrp = payload['RRP']
  const rrpKey = 'RRP'
  const startDate = rrp.start
  const rrpData = rrp.data
  const start = moment(startDate, moment.ISO_8601)
  let duration
  try {
    duration = parseInterval(rrp.interval)
  } catch (e) {
    console.error(e)
  }

  let rrpIndex = 0
  priceData.forEach(item => {
    const now = moment(start).add(duration.value * rrpIndex, duration.key)
    if (item.date.toString() === now.toDate().toString()) {
      item[rrpKey] = rrpData[rrpIndex]
      rrpIndex++
    } else {
      item[rrpKey] = rrpData[rrpIndex - 1]
    }
  })

  /** negative price cannot be logathrmic **/
  // findDate[ftKey] = ftData[x] < 0 ? -ftData[x] : ftData[x]

  return priceData
}

// TODO: deprecate this function
export function sumRegionsFuelTech (regions) {
  let data = []
  Object.keys(regions).forEach((regionKey, regionIndex) => {
    const regionFtData = regions[regionKey]

    if (!data.length) {
      // this is the first obj
      data = regionFtData.slice()
      data.forEach(d => {
        delete d.id
        delete d.region
      })
    } else {
      regionFtData.forEach(region => {
        const findFT = data.find(d => d.fuel_tech === region.fuel_tech)
        if (findFT) {
          // if found, add to the existing fuel tech
          const objData = findFT.history.data
          const srcData = region.history.data

          objData.forEach((value, index) => {
            objData[index] = value + srcData[index]
          })
        } else {
          // else add as a new one
          delete region.id
          delete region.region
          data.push(region)
        }
      })
    }
  })

  // return everything except pricing
  return data.filter(d => {
    return d.type !== 'price'
  })
}

/** Parse interval:
    - years = y
    - months = M
    - weeks = w
    - days = d
    - hours = h
    - minutes = m
    - seconds = s
**/
const durationKeys = ['s', 'm', 'h', 'd', 'w', 'M', 'y']

/**
  returns {key, value}
  if string contains only key, value is 1
**/
function parseInterval (string) {
  const length = string.length
  const key = string.charAt(length - 1)
  const value = (length === 1) ? 1 : parseInt(string.substring(0, length - 1))

  if (durationKeys.includes(key)) {
    return {
      key,
      value
    }
  } else {
    throw new Error(`Invalid duration key: ${key}`)
  }
}

/**
  compares 2 duration and returns the shorter one
  - use durationKey index - the smaller the index, the shorter the duration
**/
function compareAndGetShortestInterval (duration1, duration2, returnDuration) {
  const duration1Index = durationKeys.indexOf(duration1.key)
  const duration2Index = durationKeys.indexOf(duration2.key)
  const duration1Value = duration1.value
  const duration2Value = duration2.value

  if (duration1Index < duration2Index) {
    return returnDuration ? duration1 : true
  } else if (duration2Index < duration1Index) {
    return returnDuration ? duration2 : false
  }

  if (duration1Value < duration2Value) {
    return returnDuration ? duration1 : true
  } else if (duration2Value < duration1Value) {
    return returnDuration ? duration2 : false
  } else {
    // both durations are the same, return the first one
    return returnDuration ? duration1 : true
  }
}
