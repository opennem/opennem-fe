import * as moment from 'moment'
import { FUEL_TECH } from './FuelTechConfig'

export function generateChartData(data) {
  let chartData = []

  Object.keys(FUEL_TECH).forEach(ftKey => {
    if (data[ftKey]) {
      const ft = data[ftKey]
      const startDate = ft.start
      let interval = ftKey === 'RRP' ? 30 : 5 // ft.interval
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
        const d = ftKey === 'NETINTERCHANGE' ? -ftData[i] : ftData[i]

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
