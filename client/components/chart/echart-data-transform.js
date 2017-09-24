import * as moment from 'moment'

export default function(data) {
  let series = []
  let groups = []
  let legend = []
  let colours = {
    'rooftop_solar': '#ffffb3',
    'distillate': '#000',
    'gas_ocgt': '#FFCD96',
    'gas_ccgt': '#FDB462',
    'gas_steam': '#F48E1B',
    'wind': '#417505',
  }

  groups = Object.keys(data)

  let dataLength = data[groups[0]].data.length
  let start = moment(data[groups[0]].start, moment.ISO_8601)
  let interval = 5
  let dates = [start.format('LT, L')]

  for (let i=1; i<=dataLength; i++) {
    let now = moment(start).add(interval*i, 'm')
    dates.push(moment(now).format('LT'))
  }

  groups = []

  Object.entries(colours).forEach(([key,colourCode]) => {
    console.log(key + ' ' + colourCode)

    series.push({
      name: key,
      type: 'line',
      stack: 'total-ft',
      areaStyle: {normal: {color: colourCode}},
      lineStyle: {normal: {color: 'transparent'}},
      symbol: 'roundRect',
      data: data[key].data
    })

    legend.push({
      name: key,
      icon: 'roundRect'
    })

    groups.push(key)
  })

  console.log(legend)

  // groups.forEach(ft => {
    
  // })

  console.log(groups)

  return {
    dates,
    series,
    groups,
    colours: Object.values(colours)
  }
}