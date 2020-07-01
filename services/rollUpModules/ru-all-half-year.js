import moment from 'moment'
import { timeMonth } from 'd3-time'
import rollUp from './roll-up'
import { setStartOfMonth, getHalfYearStartMonth } from './roll-up-helpers'

export default function(ids, data) {
  let currentMonth = moment(data[0].date).month()
  let nestDate = setStartOfMonth(
    data[0].date,
    getHalfYearStartMonth(currentMonth)
  )
  let isIncompleteEnd = false,
    isIncompleteStart = false

  data.forEach((d, i) => {
    const q = moment(d.date).month()
    nestDate = setStartOfMonth(d.date, getHalfYearStartMonth(q))
    data[i].nestDate = nestDate.toDate()

    if (i === 0) {
      const startDate = moment(d.date).set('hour', 0)
      const startOfHalfYear = timeMonth.every(6).floor(d.date)
      isIncompleteStart = moment(startDate).isAfter(startOfHalfYear)
    }

    if (i === data.length - 1) {
      const endDate = moment(d.date).set('hour', 0)
      const endOfHalfYear = moment(timeMonth.every(6).ceil(d.date)).subtract(
        1,
        'month'
      )
      isIncompleteEnd = moment(endDate).isBefore(endOfHalfYear)
    }
  })

  return rollUp(ids, data, isIncompleteStart, isIncompleteEnd)
}
