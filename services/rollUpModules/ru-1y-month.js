import moment from 'moment'
import rollUp from './roll-up'

function setStartMonth(date, currentMonth) {
  const d = moment(date)
  d.set('month', currentMonth)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export default function(ids, data) {
  let currentMonth = moment(data[0].date).month()
  let nestDate = setStartMonth(data[0].date, currentMonth)

  data.forEach((d, i) => {
    const q = moment(d.date).month()
    nestDate = setStartMonth(d.date, q)
    data[i].nestDate = nestDate.toDate()
  })

  return rollUp(ids, data)
}
