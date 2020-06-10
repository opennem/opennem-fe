import moment from 'moment'
import { timeMonth } from 'd3-time'
import rollUp from './roll-up'
import { setStartOfMonth, setEndOfMonth } from './roll-up-helpers'

export default function(ids, data) {
  let currentMonth = moment(data[0].date).month()
  let nestDate = setStartOfMonth(data[0].date, currentMonth)
  let isIncompleteEnd = false,
    isIncompleteStart = false

  data.forEach((d, i) => {
    const q = moment(d.date).month()
    nestDate = setStartOfMonth(d.date, q)
    data[i].nestDate = nestDate.toDate()

    if (i === 0) {
      const startDate = moment(d.date).set('hour', 0)
      const startOfMonth = timeMonth.floor(d.date)
      isIncompleteStart = moment(startDate).isAfter(startOfMonth)
    }

    if (i === data.length - 1) {
      const endDate = moment(d.date).set('hour', 0)
      const endOfMonth = setEndOfMonth(
        moment(timeMonth.ceil(d.date)).subtract(1, 'day')
      )
      isIncompleteEnd = moment(endDate).isBefore(endOfMonth)
    }
  })

  return rollUp(ids, data, isIncompleteStart, isIncompleteEnd)
}
