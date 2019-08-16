import moment from 'moment'
import rollUp from './roll-up'

function setStartDay(date) {
  const d = moment(date)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export default function(ids, data) {
  let nestDate = setStartDay(data[0].date)

  data.forEach((d, i) => {
    nestDate = setStartDay(d.date)
    data[i].nestDate = nestDate.toDate()
  })

  return rollUp(ids, data)
}
