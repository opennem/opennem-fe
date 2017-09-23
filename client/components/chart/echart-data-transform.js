import * as moment from 'moment'

export default function(data) {
  let series = []
  let groups = []
  let legend = []

  groups = Object.keys(data)

  let dataLength = data[groups[0]].data.length
  let start = moment(data[groups[0]].start, moment.ISO_8601)
  let interval = 5
  let dates = [start.format('LT, L')]

  for (let i=1; i<=dataLength; i++) {
    let now = moment(start).add(interval*i, 'm')
    dates.push(moment(now).format('LT'))
  }

  groups.forEach(ft => {
    series.push({
      name: ft,
      type: 'line',
      stack: 'total-ft',
      areaStyle: {normal: {}},
      symbol: 'roundRect',
      data: data[ft].data
    })

    legend.push({
      name: ft,
      icon: 'roundRect'
    })
  })

  console.log(groups)

  return {
    dates,
    series,
    groups
  }
}