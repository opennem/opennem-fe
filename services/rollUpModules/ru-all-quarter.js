import moment from 'moment'
import { timeMonth } from 'd3-time'
import rollUp from './roll-up'
import {
  setStartOfMonth,
  setEndOfMonth,
  getQuarterStartMonth
} from './roll-up-helpers'

export default function(ids, data) {
  let currentMonth = moment(data[0].date).month()
  let nestDate = setStartOfMonth(
    data[0].date,
    getQuarterStartMonth(currentMonth)
  )
  let isIncompleteEnd = false,
    isIncompleteStart = false

  data.forEach((d, i) => {
    const q = moment(d.date).month()
    nestDate = setStartOfMonth(d.date, getQuarterStartMonth(q))
    data[i].nestDate = nestDate.toDate()

    if (i === 0) {
      const startDate = moment(d.date).set('hour', 0)
      const startOfQuarter = timeMonth.every(3).floor(d.date)
      isIncompleteStart = moment(startDate).isAfter(startOfQuarter)
    }

    if (i === data.length - 1) {
      const endDate = moment(d.date).set('hour', 0)
      const endOfQuarter = setEndOfMonth(
        moment(timeMonth.every(3).ceil(d.date)).subtract(1, 'day')
      )
      isIncompleteEnd = moment(endDate).isBefore(endOfQuarter)
    }
  })

  return rollUp(ids, data, isIncompleteStart, isIncompleteEnd)
}
