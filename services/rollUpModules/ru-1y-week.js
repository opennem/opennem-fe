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

export default function(ids, data, weekDay = 0) {
  let day = moment(data[0].date).weekday(weekDay)
  let nestDate = setStartDay(day)
  let isIncompleteEnd = false,
    isIncompleteStart = false

  data.forEach((d, i) => {
    const q = moment(d.date).weekday(weekDay)
    nestDate = setStartDay(q)
    data[i].nestDate = nestDate.toDate()

    if (i === 0) {
      const startDate = moment(d.date)
      const startWeekDate = moment(d.date).weekday(0)
      isIncompleteStart = moment(startDate).isAfter(startWeekDate)
    }

    if (i === data.length - 1) {
      const endDate = moment(d.date)
      const endWeekDate = moment(d.date).weekday(6)
      isIncompleteEnd = moment(endDate).isBefore(endWeekDate)
    }
  })

  return rollUp(ids, data, isIncompleteStart, isIncompleteEnd)
}
