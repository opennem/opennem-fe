import * as moment from 'moment'

/* transform the dataset */

/* TODO: Refactor 
  - split the data tranform from the echart config settings
  - pull out constants (colours, labels)

  DATA
  - ft -> colours and labels
  - ft ordering


  CHART SETTINGS
  - midnight gridlines
  - price gridlines(?)
  - series line/area styles

*/

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

export default function(data) {
  let series = []
  let ftSeries = []
  let priceSeries = []
  let groups = []
  let legend = []
  const colours = Object.keys(FUEL_TECH_CONFIG).map((key) => FUEL_TECH_CONFIG[key].colour)
  const firstSeries = Object.keys(data)[0]
  const dataLength = data[firstSeries].data.length
  let start = moment(data[firstSeries].start, moment.ISO_8601)
  let interval = 5
  let dates = [moment(start).format('LT, D MMM')]

  for (let i=1; i<=dataLength; i++) {
    let now = moment(start).add(interval*i, 'm')
    dates.push(moment(now).format('LT, D MMM'))
  }

  const rrpData = data['RRP'].data
  let priceData = []
  let emptyData = []
  let rrpIndex = 0
  let dateIndex = 5

  dates.forEach((date, index) => {
    if (dateIndex === index) {
      priceData.push(rrpData[rrpIndex])
      dateIndex += 6 // go to next 30m period
      rrpIndex++
    } else {
      let prevPrice = rrpData[rrpIndex-1]
      priceData.push(prevPrice ? prevPrice : 0)
    }
    emptyData.push(null);
  })

  let hasOffset = null

  Object.entries(FUEL_TECH_CONFIG).forEach(([key, ftConfig]) => {
    let stack = 'total-ft'
    let areaStyle = { normal: { color: ftConfig.colour } }
    let lineStyle = { normal: { color: 'transparent' } }
    let seriesData = []
    let nonOffsetData = []
    let offset = null

    if (key === 'NETINTERCHANGE') {
      /* find out the MAX of this series to recalculate the data series */
      offset = Math.max(...data[key].data);

      if (!hasOffset) {
        hasOffset = offset
      }

      data[key].data.forEach((value) => {
        seriesData.push(-value+offset)
        nonOffsetData.push(-value)
      })
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
  }) 

  // add markLine only to the last item in the series, TODO: due to series toggle, better to add markline to an 'empty series'.
  if (hasOffset) {
    let interchangeMarkLines = []

    for (let i=0; i<10; i++) {
      interchangeMarkLines.push({
        name: (i*500).toString(),
        yAxis: (i*500)+hasOffset
      })
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

    console.log(interchangeMarkLines)
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

  let priceTopChart = {
    name: 'price',
    label: 'Price',
    type: 'line',
    step: 'end',
    data: priceData,
    dataSum: priceData.reduce((a, b) => a + b, 0),
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
      data: priceGridLines1
    }
  }

  let priceBottomChart = {
    name: 'price2',
    label: 'Price',
    type: 'line',
    step: 'end',
    data: priceData,
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
      data: priceGridLines2
    }
  }

  series.push(priceTopChart)
  series.push(priceBottomChart)

  priceSeries.push(priceTopChart)
  priceSeries.push(priceBottomChart)

  return {
    dates,
    series,
    ftSeries,
    priceSeries,
    groups,
    colours
  }
}