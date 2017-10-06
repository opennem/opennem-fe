import * as moment from 'moment'

/* transform the dataset */

export default function(data) {
  let series = []
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
    { name: '\n2 Mar', xAxis: '12:00 AM, Mar 2' }, { name: '\n3 Mar', xAxis: '12:00 AM, Mar 3' }, { name: '\n4 Mar', xAxis: '12:00 AM, Mar 4' }, 
    { name: '\n5 Mar', xAxis: '12:00 AM, Mar 5' }, { name: '\n6 Mar', xAxis: '12:00 AM, Mar 6' }, { name: '\n7 Mar', xAxis: '12:00 AM, Mar 7' }, { name: '\n8 Mar', xAxis: '12:00 AM, Mar 8' }
  ]
  // 
  let priceGridLines1 = [
    { name: '1,000', yAxis: 1000 }, { name: '5,000', yAxis: 5000 }, { name: '', xAxis: '12:00 AM, Mar 2' }, { name: '', xAxis: '12:00 AM, Mar 3' }, 
    { name: '', xAxis: '12:00 AM, Mar 4' },  { name: '', xAxis: '12:00 AM, Mar 5' }, { name: '', xAxis: '12:00 AM, Mar 6' }, { name: '', xAxis: '12:00 AM, Mar 7' }, 
    { name: '', xAxis: '12:00 AM, Mar 8' }
  ]
  //{ name: '$0', yAxis: 0 }, { name: '$50', yAxis: 50 }, { name: '$100', yAxis: 100 }, 
  let priceGridLines2 = [
    { name: '', xAxis: '12:00 AM, Mar 2' }, { name: '', xAxis: '12:00 AM, Mar 3' }, 
    { name: '', xAxis: '12:00 AM, Mar 4' },  { name: '', xAxis: '12:00 AM, Mar 5' }, { name: '', xAxis: '12:00 AM, Mar 6' }, { name: '', xAxis: '12:00 AM, Mar 7' }, 
    { name: '', xAxis: '12:00 AM, Mar 8' }
  ]

  groups = Object.keys(data)

  let dataLength = data[groups[0]].data.length
  let start = moment(data[groups[0]].start, moment.ISO_8601)
  let interval = 5
  let dates = [moment(start).format('LT, MMM D')]

  for (let i=1; i<=dataLength; i++) {
    let now = moment(start).add(interval*i, 'm')
    dates.push(moment(now).format('LT, MMM D'))
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
      priceData.push(rrpData[rrpIndex-1])
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

    series.push({
      name: key,
      label: labels[key],
      type: 'line',
      stack: stack,
      areaStyle: areaStyle,
      lineStyle: lineStyle,
      symbol: 'roundRect',
      symbolSize: 0,
      data: seriesData,
      dataSum: seriesData.reduce((a, b) => a + b, 0),
      colour: colourCode
    })

    legend.push({
      name: key,
      icon: 'roundRect'
    })

    groups.push(key)
  })

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

  series.push({
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
  })

  series.push({
    name: 'price2',
    label: 'Price',
    type: 'line',
    step: 'end',
    data: priceData,
    dataSum: priceData.reduce((a, b) => a + b, 0),
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
  })

  let coloursCode = Object.values(colours)

  return {
    dates,
    series,
    groups,
    colours: coloursCode
  }
}