import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import isAfter from 'date-fns/isAfter'
import isBefore from 'date-fns/isBefore'
import rollUp from './energyRollUp'

export default function(domains, data) {
  let isIncompleteEnd = false,
    isIncompleteStart = false
  data.forEach((d, i) => {
    const start = startOfMonth(d.date)
    data[i]._rollUpDate = start.getTime()

    if (i == 0) {
      isIncompleteStart = isAfter(d.date, start)
    }
    if (i === data.length - 1) {
      const end = endOfMonth(d.date)
      isIncompleteEnd = isBefore(d.date, end)
    }
  })
  return rollUp(domains, data, isIncompleteStart, isIncompleteEnd)
}
