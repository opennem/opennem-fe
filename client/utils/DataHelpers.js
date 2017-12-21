import * as moment from 'moment'
import { FUEL_TECH } from './FuelTechConfig'

export function generateChartData(data) {
  let chartData = []

  Object.keys(FUEL_TECH).forEach(ftKey => {
    if (data[ftKey]) {
      const ft = data[ftKey]
      const startDate = ft.start
      const ftData = ft.data
      const hasChartData = chartData.length ? true : false
      let duration

      try {
        duration = parseInterval(ft.interval)
      } catch(e) {
        console.error(e)
      }

      const start = moment(startDate, moment.ISO_8601)

      for (let i=0; i<ftData.length; i++) {
        const now = moment(start).add(duration.value*i, duration.key)
        const d = (ftKey === 'NETINTERCHANGE' || ftKey === 'pumps') ? -ftData[i] : ftData[i]

        if (!hasChartData) {
          chartData[i] = {
            date: now.toDate()
          }

        }
        chartData[i][ftKey] = d
      }
    }
  })

  return chartData
}

export function generateSummaryData(chartData, start, end) {
  let filteredData = chartData.filter(item => {
    return moment(item.date).isBetween(start, end)
  })

  if (filteredData[0]) {
    const sourcesData = []
    const loadsData = []

    Object.keys(filteredData[0]).forEach(ft => {
      if (ft !== "date" && ft !== "DEMAND_AND_NONSCHEDGEN" && ft !== "RRP") {
        const totalPower = filteredData.reduce((a, b) => {
          return a + b[ft]
        }, 0)
        const dataPrice = filteredData.map((d, i) => {
          const rrp = filteredData[i]["RRP"] ? filteredData[i]["RRP"] : 0
          return d[ft] * rrp
        })
        const averagePrice = dataPrice.reduce((a, b) => a + b, 0) / totalPower
        const row = {
          id: ft,
          range: {
            totalPower,
            energy: totalPower / 12000,
            averagePrice
          }
        }

        // Split into loads and sources
        // - add Netinterchange into source because it contains both load and source data
        if (ft === "pumps" || ft === "NETINTERCHANGE") {
          loadsData.push(row)
        } 
        if (ft !== "pumps") {
          sourcesData.push(row)
        }
      }
    })

    console.log(loadsData)

    return {
      sourcesData: sourcesData.reverse(),
      loadsData
    }
  } else {
    return {
      sourcesData: [],
      loadsData: []
    }
  }
}

export function generatePriceData(chartSeries, payload) {
  const priceData = [].concat(chartSeries)
  const rrp = payload['RRP']
  const rrpKey = 'RRP'
  const startDate = rrp.start
  const interval = 30 // rrp.interval
  const rrpData = rrp.data
  const start = moment(startDate, moment.ISO_8601)

  let rrpIndex = 0
  priceData.forEach(item => {
    const now = moment(start).add(interval*rrpIndex, 'm')
    if (item.date.toString() === now.toDate().toString()) {
      item[rrpKey] = rrpData[rrpIndex]
      rrpIndex++
    } else {
      item[rrpKey] = rrpData[rrpIndex-1]
    }
  })

  /*** negative price cannot be logathrmic *****/
  // findDate[ftKey] = ftData[x] < 0 ? -ftData[x] : ftData[x]

  return priceData
}

export function sumRegionsFuelTech(regions) {
  let data = null
  Object.keys(regions).forEach((regionKey, regionIndex) => {
    const regionFtData = regions[regionKey]
    if (!data) {
      data = _.cloneDeep(regionFtData)
    } else {
      data = _.mergeWith(data, regionFtData, (objValue, srcValue) => {
        if (objValue) {
          const objData = objValue.data
          const srcData = srcValue.data

          objData.forEach((value, index) => {
            objData[index] = value + srcData[index]
          })

          objValue.data = objData

          return objValue
        } else {
          return srcValue
        }
      })
    }
  })
  return data
}

/*** Parse interval:
    - years = y
    - months = M
    - weeks = w
    - days = d
    - hours = h
    - minutes = m
    - seconds = s
***/
const durationKeys = ['y', 'M', 'w', 'd', 'h', 'm', 's']

/***
  returns {key, value}
  if string contains only key, value is 1
***/
function parseInterval(string) {
  const length = string.length
  const key = string.charAt(length-1)
  const value = (length === 1) ? 1 : parseInt(string.substring(0, length-1))

  if (durationKeys.includes(key)) {
    return {
      key,
      value
    }
  } else {
    throw `Invalid duration key: ${key}`
  }
}
