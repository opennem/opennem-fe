import moment from 'moment'
import rollUp from './roll-up'

function setStartMonday(whichMonday) {
  const d = moment(whichMonday)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export default function(ids, data) {
  let monday = moment(data[0].date).day('Monday')
  let nestDate = setStartMonday(monday)

  data.forEach((d, i) => {
    const q = moment(d.date).day('Monday')
    nestDate = setStartMonday(q)
    data[i].nestDate = nestDate.toDate()
  })

  return rollUp(ids, data)
}
