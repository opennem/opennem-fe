import * as _ from 'lodash'
import * as moment from 'moment'
import { extent } from 'd3-array'
import numeral from 'numeral'
import { FUEL_TECH } from './FuelTechConfig'

export function generateChartData (data) {
  const container = {}
  const ftPriceIntervals = {}
  let shortestInterval = null
  let startGenerationTime = null
  let lastGenerationTime = null

  // Find out what FT key (and price) is available in this dataset
  const keys = []
  Object.keys(FUEL_TECH).forEach(ftKey => {
    const find = data.find(d => d.fuel_tech === ftKey)
    const hasPrice = data.find(d => d.type === ftKey)
    const hasTemperature = data.find(d => d.type === ftKey)

    if (find || hasPrice || hasTemperature) {
      keys.push(ftKey)

      if (!lastGenerationTime && find) {
        lastGenerationTime = find.history.last
      }
      if (!startGenerationTime && find) {
        startGenerationTime = find.history.start
      }

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
    const priceOrTemperature = data.find(d => d.type === ftKey)
    const history = currentData ? currentData['history'] : (priceOrTemperature ? priceOrTemperature['history'] : null)

    if (currentData || priceOrTemperature) {
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

  // Create array based on date maps
  Object.keys(container).forEach(dateKey => {
    const obj = Object.assign({}, container[dateKey])
    obj.date = moment(dateKey).toDate()

    newChartData.push(obj)
  })

  // sort the array based on the date
  newChartData.sort((a, b) => {
    return moment(a.date).valueOf() - moment(b.date).valueOf()
  })

  // fill in gaps for series that has longer intervals
  // also populate pricePos and priceNeg for log charts
  newChartData.forEach(d => {
    longerIntervalSeries.forEach(series => {
      const isPrice = series.key === 'price'

      if (d[series.key] !== null) {
        series.currentValue = d[series.key]
      } else if (d[series.key] === null) {
        if (series.key !== 'temperature') {
          d[series.key] = series.currentValue
        }
      }

      if (isPrice) {
        d['pricePos'] = d[series.key] > 0 ? d[series.key] : 0.001
        d['priceNeg'] = d[series.key] < 0 ? -d[series.key] : 0.001
      }
    })
  })

  // only show data within the start and end range of the 5 min FT
  const updatedChartData = newChartData.filter(d => {
    return moment(d.date).isSameOrAfter(moment(startGenerationTime)) &&
      moment(d.date).isSameOrBefore(moment(lastGenerationTime))
  })

  return updatedChartData.slice(0)
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
    return name !== 'date' &&
      name !== 'price' &&
      name !== 'pricePos' &&
      name !== 'priceNeg' &&
      name !== 'temperature'
  }

  // Check if FT is a load
  // TODO: use FUEL_TECH_CONFIG to check whether it is a load or type
  function isLoad (name) {
    return name === 'pumps' ||
      name === 'exports' ||
      name === 'battery_charging'
  }

  // Check if FT is a renewable
  function isRenewableFT (name) {
    return name === 'wind' ||
      name === 'biomass' ||
      name === 'hydro' ||
      name === 'rooftop_solar' ||
      name === 'solar'
  }

  /** Get only data between the start and end dates **/
  const filteredData = data.filter(item => {
    const d = moment(item.date)
    return d.isSameOrAfter(start) && d.isSameOrBefore(end)
  })

  /** No zooming function, so just clone the data  */
  // const filteredData = data.slice(0)

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

    // create a new array with the ft (renewables only) totals
    const renewablesDataSum = filteredData.map((d, i) => {
      let p = 0
      Object.keys(d).forEach(ft => {
        if (isValidFT(ft) && isRenewableFT(ft)) {
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

        if (isLoad(ft)) {
          loadsData.push(row)
        } else {
          sourcesData.push(row)
        }
        allData.push(row)
      }
    })

    return {
      allData,
      sourcesData: sourcesData.reverse(), // to display from top to bottom in the table.
      loadsData,
      totalPower,
      totalAveragePrice,
      temperatureExtent: getExtent(filteredData, filteredData.map(d => d.temperature)),
      priceExtent: getExtent(filteredData, filteredData.map(d => d.price)),
      demandExtent: getExtent(filteredData, dataSum),
      renewablesExtent: getExtent(filteredData, renewablesDataSum)
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

function getExtent (data, arr) {
  if (arr.length === 0) {
    return -1
  }

  let min = arr[0]
  let max = arr[0]
  let minIndex = 0
  let maxIndex = 0

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i
      max = arr[i]
    }

    if (min === null || arr[i] < min) {
      if (arr[i] !== null) {
        minIndex = i
        min = arr[i]
      }
    }
  }

  const returnedExtent = [{
    value: min,
    date: data[minIndex].date
  }, {
    value: max,
    date: data[maxIndex].date
  }]

  return returnedExtent
}

export function formatNumber (number, precision, unit) {
  const formatter = precision || '0,0'

  unit = unit === undefined ? '' : unit

  const formatted =
    number === 0 || isNaN(number)
      ? '-'
      : numeral(number).format(formatter) + unit

  return formatted
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

  if (_.includes(durationKeys, key)) {
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
