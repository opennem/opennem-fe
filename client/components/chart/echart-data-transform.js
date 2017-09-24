import * as moment from 'moment'

export default function(data) {
  let series = []
  let groups = []
  let legend = []
  let colours = {
    'rooftop_solar': '#F8E71C',
    'distillate': '#F35020',
    'wind': '#417505',
    'gas_ocgt': '#FFCD96',
    'gas_ccgt': '#FDB462',
    'gas_steam': '#F48E1B',
    'DEMAND_AND_NONSCHEDGEN': '#C3D6E7',
    'NETINTERCHANGE': 'steelblue'
  }

  groups = Object.keys(data)

  let dataLength = data[groups[0]].data.length
  let start = moment(data[groups[0]].start, moment.ISO_8601)
  let interval = 5
  let dates = [moment(start).format('LT, L')]

  let rrpData = data['RRP'].data
  let priceData = []

  for (let i=1; i<=dataLength; i++) {
    let now = moment(start).add(interval*i, 'm')
    dates.push(moment(now).format('LT'))
  }

  let rrpIndex = 0
  dates.forEach((value, index) => {
    if (index && index % 5 === 0) {
      // console.log(index)
      priceData.push(rrpData[rrpIndex])
      rrpIndex++
    } else {
      priceData.push(null)
    }
  })

  console.log(priceData)

  // reset groups so to be re-ordered based on the colour ordering
  groups = []

  Object.entries(colours).forEach(([key,colourCode]) => {

    let stack = (key === 'DEMAND_AND_NONSCHEDGEN' ? null : 'total-ft')
    let areaStyle = (key === 'DEMAND_AND_NONSCHEDGEN' || key === 'NETINTERCHANGE' ? {normal: {color: 'transparent'}} : {normal: {color: colourCode}})
    let lineStyle = (key === 'DEMAND_AND_NONSCHEDGEN' || key === 'NETINTERCHANGE' ? {normal: {color: '#666'}} : {normal: {color: 'transparent'}})
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
      type: 'line',
      stack: stack,
      areaStyle: areaStyle,
      lineStyle: lineStyle,
      symbol: 'roundRect',
      data: seriesData
    })

    legend.push({
      name: key,
      icon: 'roundRect'
    })

    groups.push(key)
  })

  series.reverse()

  series.push({
    name: 'price',
    type: 'line',
    symbol: 'roundRect',
    data: priceData,
    xAxisIndex: 1,
    yAxisIndex: 1,
    connectNulls: true,
    lineStyle: {normal: {color: '#999'}},
  })

  groups.reverse()

  let coloursCode = Object.values(colours)
  coloursCode.reverse()


  return {
    dates,
    series,
    groups,
    colours: coloursCode
  }
}