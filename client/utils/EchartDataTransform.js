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

export default function(data) {
  let series = []
  let ftSeries = []
  let priceSeries = []
  let groups = []
  let legend = []
  let colours = {
    'NETINTERCHANGE': '#44146F',
    // 'DEMAND_AND_NONSCHEDGEN': '#333',
    'gas_steam': '#F48E1B',
    'gas_ccgt': '#FDB462',
    'gas_ocgt': '#FFCD96',
    'wind': '#417505',
    'distillate': '#F35020',
    'rooftop_solar': '#F8E71C',
  }
  let labels = {
    'NETINTERCHANGE': 'Interconnectors',
    // 'DEMAND_AND_NONSCHEDGEN': 'Demand',
    'gas_steam': 'Gas (Steam)',
    'gas_ccgt': 'Gas (CCGT)',
    'gas_ocgt': 'Gas (OCGT)',
    'wind': 'Wind',
    'distillate': 'Distillate',
    'rooftop_solar': 'Solar (Rooftop)',
  }
  let datesGridLines = [
    { name: '\n2 Mar', xAxis: '12:00 AM, 2 Mar' }, { name: '\n3 Mar', xAxis: '12:00 AM, 3 Mar' }, { name: '\n4 Mar', xAxis: '12:00 AM, 4 Mar' }, 
    { name: '\n5 Mar', xAxis: '12:00 AM, 5 Mar' }, { name: '\n6 Mar', xAxis: '12:00 AM, 6 Mar' }, { name: '\n7 Mar', xAxis: '12:00 AM, 7 Mar' }, { name: '\n8 Mar', xAxis: '12:00 AM, 8 Mar' }
  ]
  // 
  let priceGridLines1 = [
    { name: '1,000', yAxis: 1000 }, { name: '5,000', yAxis: 5000 }, { name: '', xAxis: '12:00 AM, 2 Mar' }, { name: '', xAxis: '12:00 AM, 3 Mar' }, 
    { name: '', xAxis: '12:00 AM, 4 Mar' },  { name: '', xAxis: '12:00 AM, 5 Mar' }, { name: '', xAxis: '12:00 AM, 6 Mar' }, { name: '', xAxis: '12:00 AM, 7 Mar' }, 
    { name: '', xAxis: '12:00 AM, 8 Mar' }
  ]
  //{ name: '$0', yAxis: 0 }, { name: '$50', yAxis: 50 }, { name: '$100', yAxis: 100 }, 
  let priceGridLines2 = [
    { name: '', xAxis: '12:00 AM, 2 Mar' }, { name: '', xAxis: '12:00 AM, 3 Mar' }, 
    { name: '', xAxis: '12:00 AM, 4 Mar' },  { name: '', xAxis: '12:00 AM, 5 Mar' }, { name: '', xAxis: '12:00 AM, 6 Mar' }, { name: '', xAxis: '12:00 AM, 7 Mar' }, 
    { name: '', xAxis: '12:00 AM, 8 Mar' }
  ]

  let coloursCode = Object.values(colours)
  groups = Object.keys(data)

  let dataLength = data[groups[0]].data.length
  let start = moment(data[groups[0]].start, moment.ISO_8601)
  let interval = 5
  let dates = [moment(start).format('LT, D MMM')]

  for (let i=1; i<=dataLength; i++) {
    let now = moment(start).add(interval*i, 'm')
    dates.push(moment(now).format('LT, D MMM'))
  }

  let rrp = data['RRP']
  let rrpData = rrp.data

  let priceData = []
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
  })

  // reset groups to be re-ordered based on the colour ordering
  groups = []

  Object.entries(colours).forEach(([key,colourCode]) => {

    let stack = (key === 'DEMAND_AND_NONSCHEDGEN' ? null : 'total-ft')
    let areaStyle = (key === 'DEMAND_AND_NONSCHEDGEN' ? {normal: {color: 'transparent'}} : {normal: {color: colourCode}})
    let lineStyle = (key === 'DEMAND_AND_NONSCHEDGEN' ? {normal: {color: colourCode, width: 1}} : {normal: {color: 'transparent'}})
    let seriesData = []

    if (key === 'NETINTERCHANGE') {
      data[key].data.forEach((value) => {
        seriesData.push(-value)
      })
    } else {
      seriesData = data[key].data
    }

    let seriesObj = {
      name: key,
      label: labels[key],
      type: 'line',
      stack: stack,
      sampling: 'average',
      areaStyle: areaStyle,
      lineStyle: lineStyle,
      symbol: 'roundRect',
      symbolSize: 0,
      data: seriesData,
      dataSum: seriesData.reduce((a, b) => a + b, 0),
      colour: colourCode
    }

    series.push(seriesObj)
    ftSeries.push(seriesObj)
    legend.push({
      name: key,
      icon: 'roundRect'
    })
    groups.push(key)
  })

  // add markLine only to the last item in the series
  series[series.length-1].markLine = {
    silent: true,
    symbolSize: 0,
    precision: 1,
    label: {normal: {show: true, position: 'start', formatter: '{b}'}},
    lineStyle: {
      normal: {width: 1, color: '#333', type: 'solid', opacity: 0.2}
    },
    data: datesGridLines
  }

  // setup price obj
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
    colours: coloursCode
  }
}