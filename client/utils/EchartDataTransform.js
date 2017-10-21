import * as moment from 'moment'
import numeral from 'numeral'

/* transform the dataset */

const FUEL_TECH_CONFIG = {
  'NETINTERCHANGE': {
    colour: '#44146F',
    label: 'Import/Export'
  },
  'gas_steam':{
    colour: '#F48E1B',
    label: 'Gas (Steam)'
  },
  'gas_ccgt':{
    colour: '#FDB462',
    label: 'Gas (CCGT)'
  },
  'gas_ocgt':{
    colour: '#FFCD96',
    label: 'Gas (OCGT)'
  },
  'wind':{
    colour: '#417505',
    label: 'Wind'
  },
  'distillate':{
    colour: '#F35020',
    label: 'Distillate'
  },
  'rooftop_solar':{
    colour: '#F8E71C',
    label: 'Solar (Rooftop)'
  },
}

const datesGridLines = [
  { name: '\n2 Mar', xAxis: '12:00 AM, 2 Mar' }, { name: '\n3 Mar', xAxis: '12:00 AM, 3 Mar' }, { name: '\n4 Mar', xAxis: '12:00 AM, 4 Mar' }, 
  { name: '\n5 Mar', xAxis: '12:00 AM, 5 Mar' }, { name: '\n6 Mar', xAxis: '12:00 AM, 6 Mar' }, { name: '\n7 Mar', xAxis: '12:00 AM, 7 Mar' }, { name: '\n8 Mar', xAxis: '12:00 AM, 8 Mar' }
]
let zeroGridLine = [
]
// 
const priceGridLines1 = [
  { name: '1,000', yAxis: 1000 }, { name: '5,000', yAxis: 5000 }, { name: '', xAxis: '12:00 AM, 2 Mar' }, { name: '', xAxis: '12:00 AM, 3 Mar' }, 
  { name: '', xAxis: '12:00 AM, 4 Mar' },  { name: '', xAxis: '12:00 AM, 5 Mar' }, { name: '', xAxis: '12:00 AM, 6 Mar' }, { name: '', xAxis: '12:00 AM, 7 Mar' }, 
  { name: '', xAxis: '12:00 AM, 8 Mar' }
]
// { name: '$0', yAxis: 0 }, { name: '$50', yAxis: 50 }, { name: '$100', yAxis: 100 }, 
const priceGridLines2 = [
  { name: '', xAxis: '12:00 AM, 2 Mar' }, { name: '', xAxis: '12:00 AM, 3 Mar' }, 
  { name: '', xAxis: '12:00 AM, 4 Mar' },  { name: '', xAxis: '12:00 AM, 5 Mar' }, { name: '', xAxis: '12:00 AM, 6 Mar' }, { name: '', xAxis: '12:00 AM, 7 Mar' }, 
  { name: '', xAxis: '12:00 AM, 8 Mar' }
]


/* private */
function generateFormattedDateLabels(startDate, interval, dataLength) {
  const start = moment(startDate, moment.ISO_8601)
  let dates = [moment(start).format('LT, D MMM')]

  for (let i=1; i<=dataLength; i++) {
    const now = moment(start).add(interval*i, 'm')
    dates.push(moment(now).format('LT, D MMM'))
  }

  return dates
}

function generatePriceDataIn5minInterval(arr, rrpData) {
  let rrpIndex = 0
  let dateIndex = 5
  let priceData = []

  arr.forEach((item, index) => {
    if (dateIndex === index) {
      priceData.push(rrpData[rrpIndex])
      dateIndex += 6 // go to next 30m period
      rrpIndex++
    } else {
      let prevPrice = rrpData[rrpIndex-1]
      priceData.push(prevPrice ? prevPrice : 0)
    }
  })

  return priceData
}

function generateNullDataIn5minInterval(arr) {
  let nullData = []

  arr.forEach(() => {
    nullData.push(null)
  })

  return nullData
}

/* Price charts generation */
function generatePricePositiveLogChartObj(data, gridLines) {
  return {
    name: 'price',
    label: 'Price',
    type: 'line',
    step: 'end',
    data: data,
    dataSum: data.reduce((a, b) => a + b, 0),
    colour: '#444',
    symbolSize: 0,
    xAxisIndex: 1,
    yAxisIndex: 1,
    connectNulls: true,
    lineStyle: {normal: {color: '#444', type:'dotted', width: 1}},
    markLine: {
      silent: true,
      symbolSize: 0,
      precision: 1,
      label: {normal: {
        show: true, 
        position: 'start',
        formatter: '{b}'
      }},
      lineStyle: {
        normal: {width: 1, color: '#666', type: 'solid', opacity: 0.2}
      },
      data: gridLines
    }
  }
}

function generatePriceLinearChartObj(data, gridLines) {
  return {
    name: 'price2',
    label: 'Price',
    type: 'line',
    step: 'end',
    data: data,
    colour: '#444',
    symbolSize: 0,
    xAxisIndex: 2,
    yAxisIndex: 2,
    connectNulls: true,
    lineStyle: {normal: {color: '#444', width: 1}},
    markLine: {
      silent: true,
      symbolSize: 0,
      precision: 1,
      label: {normal: {
        show: true, 
        position: 'start',
        formatter: '{b}'
      }},
      lineStyle: {
        normal: {width: 1, color: '#666', type: 'solid', opacity: 0.2}
      },
      data: gridLines
    }
  }
}



export default function(data) {
  const STACK_NAME = 'total-ft'
  const colours = Object.keys(FUEL_TECH_CONFIG).map((key) => FUEL_TECH_CONFIG[key].colour)
  const firstSeries = Object.keys(data)[0]
  const startDate = data[firstSeries].start
  const dataLength = data[firstSeries].data.length
  const dates = generateFormattedDateLabels(startDate, 5, dataLength)
  const rrpData = data['RRP'].data
  const priceData = generatePriceDataIn5minInterval(dates, rrpData)
  const emptyData = generateNullDataIn5minInterval(dates)

  let series = []
  let ftSeries = []
  let priceSeries = []
  let groups = []
  let legend = []
  let hasOffset = null

  Object.entries(FUEL_TECH_CONFIG).forEach(([key, ftConfig]) => {
    let stack = STACK_NAME
    let areaStyle = { normal: { color: ftConfig.colour } }
    let lineStyle = { normal: { color: 'transparent' } }
    let seriesData = []
    let nonOffsetData = []
    let offset = null
    let importSeriesObj = null

    if (key === 'NETINTERCHANGE') {
      let importSeriesData = []

      /* find out the MAX of this series to recalculate the data series */
      offset = Math.max(...data[key].data);

      if (!hasOffset) {
        hasOffset = offset
      }

      data[key].data.forEach((value) => {
        seriesData.push(-value+offset)
        nonOffsetData.push(-value)

        importSeriesData.push(offset)        
      })

      importSeriesObj = {
        name: 'IMPORT',
        label: 'Import',
        type: 'line',
        sampling: 'average',
        areaStyle: { normal: { color: '#fff', opacity: 1 } },
        lineStyle: { normal: { color: 'transparent' } },
        symbol: 'roundRect',
        symbolSize: 0,
        data: importSeriesData,
        colour: '#44146F',
        offset,
        nonOffsetData
      }

      
    } else {
      seriesData = data[key].data
    }

    // sum
    let dataPrice, dataSum,  dataPriceSum
    if (offset) {
      dataPrice = nonOffsetData.map((ft, i) => ft * priceData[i])
      dataSum = nonOffsetData.reduce((a, b) => a + b, 0)
    } else {
      dataPrice = seriesData.map((ft, i) => ft * priceData[i])
      dataSum = seriesData.reduce((a, b) => a + b, 0)
    }
    dataPriceSum = dataPrice.reduce((a, b) => a + b, 0)

    let seriesObj = {
      name: key,
      label: ftConfig.label,
      type: 'line',
      stack,
      sampling: 'average',
      areaStyle,
      lineStyle,
      symbol: 'roundRect',
      symbolSize: 0,
      data: seriesData,
      dataPrice,
      dataSum,
      dataPriceSum,
      colour: ftConfig.colour,
      offset,
      nonOffsetData
    }

    series.push(seriesObj)
    ftSeries.push(seriesObj)
    legend.push({
      name: key,
      icon: 'roundRect'
    })
    groups.push(key)

    if (key === 'NETINTERCHANGE') {
      series.push(importSeriesObj)
    }

  }) 

  console.log(series)

  // add to the series, TODO: due to series toggle, better to add markline to an 'empty series'.
  if (hasOffset) {
    let interchangeMarkLines = []
    let zeroGridLine = []

    for (let i=0; i<10; i++) {
      interchangeMarkLines.push({
        name: numeral(i*500).format('0,0'),
        yAxis: (i*500)+hasOffset
      })

      if (i === 0) {
        zeroGridLine.push({
          name: '',
          yAxis: (i*500)+hasOffset
        })
      }
    }

    series[0].markLine = {
      silent: true,
      symbolSize: 0,
      precision: 1,
      label: {normal: {color: '#999', show: true, position: 'start', formatter: '{b}'}},
      lineStyle: {
        normal: {width: 1, color: '#333', type: 'dotted', opacity: 0.2}
      },
      data: interchangeMarkLines
    }

    series[1].markLine = {
      silent: true,
      symbolSize: 0,
      precision: 1,
      label: {normal: {show: false, color: '#999', show: true, position: 'start', formatter: '{b}'}},
      lineStyle: {
        normal: {width: 1, color: '#000', type: 'solid', opacity: 1}
      },
      data: zeroGridLine
    }
  }

  series[series.length-1].markLine = {
    silent: true,
    symbolSize: 0,
    precision: 1,
    label: {normal: {color: '#999', show: true, position: 'start', formatter: '{b}'}},
    lineStyle: {
      normal: {width: 1, color: '#333', type: 'dotted', opacity: 0.2}
    },
    data: datesGridLines
  }

  let pricePositiveLogChart = generatePricePositiveLogChartObj(priceData, priceGridLines1)
  let priceLinearChart = generatePriceLinearChartObj(priceData, priceGridLines2)

  series.push(pricePositiveLogChart)
  series.push(priceLinearChart)

  priceSeries.push(pricePositiveLogChart)
  priceSeries.push(priceLinearChart)

  return {
    dates,
    series,
    ftSeries,
    priceSeries,
    groups,
    colours
  }
}