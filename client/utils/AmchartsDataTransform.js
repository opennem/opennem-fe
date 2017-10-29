/**
 * Transform the data to suit Amcharts model
 */

import * as moment from 'moment'
import numeral from 'numeral'
import { FUEL_TECH_CONFIG } from './FuelTechConfig.js'

export function generateChartData(data) {
  let chartData = []

  Object.keys(FUEL_TECH_CONFIG).forEach(ftKey => {
    const ftLabel = FUEL_TECH_CONFIG[ftKey] 
    let ft = data[ftKey]
    let startDate = ft.start
    let interval = ftKey === 'RRP' ? 30 : 5 // ft.interval
    let ftData = ft.data
    let hasChartData = chartData.length ? true : false

    const start = moment(startDate, moment.ISO_8601)

    if (ftKey === 'RRP') {
      for (let x=0; x<ftData.length; x++) {
        const now = moment(start).add(interval*x, 'm')
        const findDate = chartData.find(item => {
          return item.date.toString() === now.toDate().toString()
        })
        /*** for RRP, any negative price cannot be logathrmic *****/
        // findDate[ftKey] = ftData[x] < 0 ? -ftData[x] : ftData[x]
        findDate[ftKey] = ftData[x]
      }
    } else {
      for (let i=0; i<ftData.length; i++) {
        const now = moment(start).add(interval*i, 'm')
        const d = ftKey === 'NETINTERCHANGE' ? -ftData[i] : ftData[i]

        if (!hasChartData) {
          chartData[i] = {
            date: now.toDate()
          }

        }
        chartData[i][ftKey] = d
      }
    }

    // if (chartData.length > 0) {
    //   if (ftKey === 'RRP') {
    //     for (let x=0; x<ftData.length; x++) {
    //       const now = moment(start).add(interval*x, 'm')
    //       const findDate = chartData.find(item => {
    //         return item.date.toString() === now.toDate().toString()
    //       })
    //       // findDate[ftKey] = ftData[x] < 0 ? -ftData[x] : ftData[x]
    //       findDate[ftKey] = ftData[x]
    //     }
    //   } else {
    //     for (let i=0; i<chartData.length; i++) {
    //       const d = ftKey === 'NETINTERCHANGE' ? -ftData[i] : ftData[i]
    //       chartData[i][ftKey] = d
    //     }
    //   }
    // } else {
    //   for (let i=0; i<ftData.length; i++) {
    //     const now = moment(start).add(interval*i, 'm')

    //     chartData[i] = {
    //       date: moment(now).toDate()
    //     }

    //     chartData[i][ftKey] = ftData[i]
    //   }
    // }

  })


  return chartData
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
