import * as moment from 'moment'

export default function(data) {
  let columns = []
  let groups = []

  groups = Object.keys(data)

  let dataLength = data[groups[0]].data.length
  let start = moment(data[groups[0]].start, moment.ISO_8601)
  let interval = 5
  let dates = [new Date(start)]

  for (let i=1; i<=dataLength; i++) {
    dates.push(new Date(moment(start).add(interval*i, 'm')))
  }

  columns = [
    ['x', ...dates]
  ]

  groups.forEach(ft => {
    columns.push([ft, ...data[ft].data])
  })

  return {
    columns,
    groups
  }
}