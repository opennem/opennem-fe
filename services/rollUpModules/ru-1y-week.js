import moment from 'moment'
import rollUp from './roll-up'

function setStartDay(day) {
  const d = moment(day)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

moment.updateLocale('en', {
  week: {
    dow: 1
  }
})

export default function(ids, data) {
  let day = moment(data[0].date).weekday(0)
  let nestDate = setStartDay(day)

  data.forEach((d, i) => {
    const q = moment(d.date).weekday(0)
    nestDate = setStartDay(q)
    data[i].nestDate = nestDate.toDate()
  })

  return rollUp(ids, data)
}
