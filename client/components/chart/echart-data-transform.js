import * as moment from 'moment'

/* transform the dataset */

export default function(data) {
  let series = []
  let groups = []
  let legend = []
  let colours = {
    'NETINTERCHANGE': '#333',
    'DEMAND_AND_NONSCHEDGEN': '#666',
    'gas_steam': '#F48E1B',
    'gas_ccgt': '#FDB462',
    'gas_ocgt': '#FFCD96',
    'wind': '#417505',
    'distillate': '#F35020',
    'rooftop_solar': '#F8E71C',
  }
  let labels = {
    'NETINTERCHANGE': 'Interconnectors',
    'DEMAND_AND_NONSCHEDGEN': 'Demand',
    'gas_steam': 'Gas (Steam)',
    'gas_ccgt': 'Gas (CCGT)',
    'gas_ocgt': 'Gas (OCGT)',
    'wind': 'Wind',
    'distillate': 'Distillate',
    'rooftop_solar': 'Solar',
  }

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
    let areaStyle = (key === 'DEMAND_AND_NONSCHEDGEN' || key === 'NETINTERCHANGE' ? {normal: {color: 'transparent'}} : {normal: {color: colourCode}})
    let lineStyle = (key === 'DEMAND_AND_NONSCHEDGEN' || key === 'NETINTERCHANGE' ? {normal: {color: colourCode, width: 1}} : {normal: {color: 'transparent'}})
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
    lineStyle: {normal: {color: '#444', width: 1}},
  })

  let coloursCode = Object.values(colours)

  return {
    dates,
    series,
    groups,
    colours: coloursCode
  }
}