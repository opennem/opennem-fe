import moment from 'moment'
import { timeMonth } from 'd3-time'
import rollUp from './roll-up'
import { getAUSeasonStartMonth } from './roll-up-helpers'

function setStartOfMonth(date, currentMonth, qMonth) {
  const d = moment(date)
  d.set('month', qMonth)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  if (currentMonth === 0 || currentMonth === 1) {
    d.subtract(1, 'year')
  }
  return d
}

export default function(ids, data) {
  let currentMonth = moment(data[0].date).month()
  let nestDate = setStartOfMonth(
    data[0].date,
    currentMonth,
    getAUSeasonStartMonth(currentMonth)
  )
  let isIncompleteEnd = false,
    isIncompleteStart = false

  data.forEach((d, i) => {
    const q = moment(d.date).month()
    nestDate = setStartOfMonth(d.date, q, getAUSeasonStartMonth(q))
    data[i].nestDate = nestDate.toDate()

    if (i === 0) {
      const startDate = moment(d.date).set('hour', 0)
      const startOfQuarter = timeMonth.every(3).floor(d.date)
      isIncompleteStart = moment(startDate).isAfter(startOfQuarter)
    }

    if (i === data.length - 1) {
      const endDate = moment(d.date).set('hour', 0)
      const endOfQuarter = moment(timeMonth.every(3).ceil(d.date)).subtract(
        1,
        'day'
      )
      isIncompleteEnd = moment(endDate).isBefore(endOfQuarter)
    }
  })

  return rollUp(ids, data, isIncompleteStart, isIncompleteEnd)
}
