import * as _ from 'lodash'
import * as moment from 'moment'
import { FUEL_TECH } from './FuelTechConfig'
import { formatNumber } from './DataHelpers'

/** Default amCharts config **/
export function chartConfig (config, forceGridCount) {
  const autoGridCount = !forceGridCount
  const gridCount = 3

  const defaultConfig = {
    path: 'dist/amcharts/',
    type: 'stock',
    addClassNames: true,
    mouseWheelZoomEnabled: true,
    // mouseWheelScrollEnabled: true,
    export: {
      enabled: false,
      menu: [],
      fileName: 'all-regions-generation'
    },
    balloon: {
      adjustBorderColor: true,
      borderAlpha: 0,
      borderThickness: 1,
      animationDuration: 0,
      pointerWidth: 6,
      fillAlpha: 1,
      fillColor: '#ece9e6',
      shadowAlpha: 0.4
    },
    categoryAxesSettings: {
      autoGridCount,
      gridCount,
      minPeriod: '5mm',
      labelOffset: -35,
      axisAlpha: 1,
      tickLength: 35,
      axisHeight: 35,
      axisColor: '#999',
      color: '#000',
      dashLength: 7,
      equalSpacing: true,
      centerLabelOnFullPeriod: false,
      groupToPeriods: ['5mm', '30mm'],
      boldPeriodBeginning: true,
      parseDates: true,
      startOnAxis: true,
      dateFormats: [
        { period: 'fff', format: '  JJ:NN' },
        // { period: 'ss', format: '  D MMM\n JJ:NN' },
        // { period: 'mm', format: '  D MMM\n JJ:NN' },
        // { period: 'hh', format: '  D MMM\n JJ:NN' },
        { period: 'ss', format: '  JJ:NN\n D MMM' },
        { period: 'mm', format: '  JJ:NN\n D MMM' },
        { period: 'hh', format: '  JJ:NN\n D MMM' },
        { period: 'DD', format: '  EEE\n  D MMM' },
        { period: 'WW', format: '  EEE\n  D MMM' },
        { period: 'MM', format: '  EEE\n  D MMM' },
        { period: 'YYYY', format: '  YYYY' }
      ]
    },
    chartCursorSettings: {
      pan: false, // If pan is set to true, zoomable is switched to false automatically.
      zoomable: true,
      categoryBalloonColor: '#C74523',
      cursorColor: '#C74523',
      showNextAvailable: true,
      valueBalloonsEnabled: true
    },
    panelsSettings: {
      fontFamily: 'Merriweather'
    },
    chartScrollbarSettings: {
      enabled: false
    }
  }

  return _.assign(defaultConfig, config)
}

/** amCharts Field Mappings **/
export function fieldMappings (keys) {
  const mappings = []

  keys.forEach(ftKey => {
    mappings.push({
      fromField: ftKey,
      toField: ftKey
    })
  })

  return mappings
}

/** amCharts Stock graphs
    - for 'load' series (i.e. NETINTERCHANGE), hide Fill colour
 **/
export function stockGraphs (keys, chartType) {
  const graphs = []

  function hideNegativeAlphas (ftKey) {
    return ftKey === 'exports' ||
      ftKey === 'imports' ||
      ftKey === 'pumps' ||
      ftKey === 'battery_charging'
  }

  function validFT (ftKey) {
    return ftKey !== 'price' &&
      ftKey !== 'pricePos' &&
      ftKey !== 'priceNeg' &&
      ftKey !== 'temperature'
  }

  function isLoad (ftKey) {
    return ftKey === 'exports' ||
      ftKey === 'pumps' ||
      ftKey === 'battery_charging'
  }

  keys.forEach((ftKey, index) => {
    if (validFT(ftKey)) {
      const colour = FUEL_TECH[ftKey].colour
      const negativeFillAlphas = hideNegativeAlphas(ftKey) ? 0 : 0.8
      const fillAlphas = 0.8
      const lineAlpha = 0.1
      const type = chartType || 'line'

      const graph = {
        id: ftKey,
        valueField: ftKey,
        type,
        fillAlphas,
        negativeFillAlphas,
        negativeFillColors: colour,
        lineAlpha: lineAlpha,
        lineColor: colour,
        useDataSetColors: false,
        showBalloon: false,
        balloonFunction: function (item, graph) {
          let balloonTxt = ''

          if (!isLoad(graph.id) && item.values.value > 0) {
            const value = formatNumber(item.dataContext[`${graph.id}Average`])
            const ftLabel = FUEL_TECH[graph.id].label

            const displayValue = value + ' MW'

            balloonTxt = `
              <div style="font-size: 1.1em;">
                <span 
                  style="display: inline-block; width: 13px; 
                    height: 13px; position: relative; top: 2px; 
                    margin-right: 5px; background: ${colour};"></span>
                ${ftLabel}: <strong> ${displayValue}</strong>
              </div>
            `
          }
          return balloonTxt
        }
      }

      // TODO: use a different style if data is forecast, not history
      // if (ftKey === 'rooftop_forecast') {
      //   graph.patternField = 'pattern'
      //   graph.pattern = {
      //     url: '/pattern.png',
      //     width: 10,
      //     height: 10
      //   }
      // }

      graphs.push(graph)
    }
  })

  return graphs
}

/** amCharts Guides
    - shade between 10pm to 7am
 **/
export function guides (start, end) {
  const startDate = moment(start)
  const endDate = moment(end)
  endDate.add(1, 'days')
  const guides = []

  while (moment(startDate).isBefore(endDate)) {
    const dayBefore = startDate.clone()
    dayBefore.subtract(1, 'days')

    guides.push({
      fillColor: '#001f3f',
      fillAlpha: 0.07,
      lineAlpha: 0,
      tickLength: 0,
      date: dayBefore.set({ 'hour': 22, 'minute': 0, 'second': 0 }).toDate(),
      toDate: startDate.set({ 'hour': 7, 'minute': 0, 'second': 0 }).toDate()
    })

    startDate.add(1, 'days')
  }

  return guides
}
