import moment from 'moment'
import rollUp from './roll-up'
import { setStartOfDay } from './roll-up-helpers'

moment.updateLocale('en', {
  week: {
    dow: 1
  }
})

export default function(ids, data, weekDay = 0) {
  let day = moment(data[0].date).weekday(weekDay)
  let nestDate = setStartOfDay(day)
  let isIncompleteEnd = false,
    isIncompleteStart = false

  data.forEach((d, i) => {
    const q = moment(d.date).weekday(weekDay)
    nestDate = setStartOfDay(q)
    data[i].nestDate = nestDate.toDate()

    if (i === 0) {
      const startDate = moment(d.date)
      const startOfWeek = moment(d.date).weekday(0)
      isIncompleteStart = moment(startDate).isAfter(startOfWeek)
    }

    if (i === data.length - 1) {
      const endDate = moment(d.date)
      const endOfWeek = moment(d.date).weekday(6)
      isIncompleteEnd = moment(endDate).isBefore(endOfWeek)
    }
  })

  return rollUp(ids, data, isIncompleteStart, isIncompleteEnd)
}
