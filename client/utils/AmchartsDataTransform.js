/**
 * Transform the data to suit Amcharts model
 * TODO: use config to generate field mappings and graph settings.
 */
import * as moment from 'moment'
import { FUEL_TECH } from './FuelTechConfig'

export function generateChartData(data) {
  let chartData = []

  Object.keys(FUEL_TECH).forEach(ftKey => {
    if (data[ftKey]) {
      let ft = data[ftKey]
      let startDate = ft.start
      let interval = ftKey === 'RRP' ? 30 : 5 // ft.interval
      let ftData = ft.data
      let hasChartData = chartData.length ? true : false
  
      const start = moment(startDate, moment.ISO_8601)
  
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

export function generateFieldMappings() {
  const mappings = [{
    fromField: 'RRP',
    toField: 'RRP'
  }]

  Object.keys(FUEL_TECH).forEach(ftKey => {
    mappings.push({
      fromField: ftKey,
      toField: ftKey
    })
  })

  return mappings
}

export function generateStockGraphs() {
  const graphs = []

  Object.keys(FUEL_TECH).forEach((ftKey, index) => {
    const colour = FUEL_TECH[ftKey].colour
    const negativeFillAlphas = ftKey === 'NETINTERCHANGE' ? 0 : 0.8
    
    graphs.push({
      id: `g${index}`,
      valueField: ftKey,
      type: 'line',
      fillAlphas: 0.8,
      negativeFillAlphas,
      negativeFillColors: colour,
      lineAlpha: 0,
      lineColor: colour,
      useDataSetColors: false,
    })
  })

  return graphs
}

export function generateChartScrollbarSettings() {
  return {
    graph: 'g7',
    usePeriod: 'hh',
    position: 'top',
    color: '#000',
    graphFillAlpha: 0,
    graphLineAlpha: 0,
    selectedGraphFillAlpha: 0,
    selectedGraphLineAlpha: 0,
    backgroundColor: '#eee',
    backgroundAlpha: 0.1,
    selectedBackgroundAlpha: 0.2,
    selectedBackgroundColor: 'steelblue',
    dragIcon: 'dragIconRectSmallBlack',
    dragIconHeight: 24,
    dragIconWidth: 24,
    scrollbarHeight: 50
  }
}

export function calculateHorizonValues(data) {
  let x = data
  let r = x/4000
  let v = []
  
  for (var y=0; y<3; y++) {
    if (r > 1) {
      v[y] = 1
      r = r - 1
    } else {
      v[y] = r ? r : 0
      r = null
    }
  }
  return v
}
