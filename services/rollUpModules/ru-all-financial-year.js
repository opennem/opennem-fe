import moment from 'moment'
import { timeMonth } from 'd3-time'
import rollUp from './roll-up'
import {
  setStartOfMonth,
  setEndOfMonth,
  setStartOfFinancialYear
} from './roll-up-helpers'

export default function(ids, energyDomains, data) {
  let currentQ = moment(data[0].date).quarter()
  let isIncompleteEnd = false,
    isIncompleteStart = false

  let nestDate = setStartOfFinancialYear(data[0].date, currentQ)

  data.forEach((d, i) => {
    const q = moment(d.date).quarter()
    nestDate = setStartOfFinancialYear(d.date, q)
    data[i].nestDate = nestDate.toDate()

    // also convert to TWh
    energyDomains.forEach(domain => {
      d[domain.id] = d[domain.id] / 1000
    })

    if (i === 0) {
      const startDate = moment(d.date).set('hour', 0)
      const startOfFY = timeMonth.every(12).floor(d.date)
      isIncompleteStart = moment(startDate).isAfter(startOfFY)
    }

    if (i === data.length - 1) {
      const endDate = moment(d.date).set('hour', 0)
      const endOfFY = moment(nestDate)
        .add(1, 'year')
        .subtract(1, 'month')
      isIncompleteEnd = moment(endDate).isBefore(endOfFY)
    }
  })

  return rollUp(ids, data, isIncompleteStart, isIncompleteEnd)
}
