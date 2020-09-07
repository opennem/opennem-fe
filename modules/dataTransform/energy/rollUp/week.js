import startOfWeek from 'date-fns/startOfWeek'
import endOfWeek from 'date-fns/endOfWeek'
import isAfter from 'date-fns/isAfter'
import isBefore from 'date-fns/isBefore'
import rollUp from './energyRollUp'

export default function(domains, data) {
  let isIncompleteEnd = false,
    isIncompleteStart = false,
    incompleteStartDate = null,
    incompleteEndDate = null

  data.forEach((d, i) => {
    const start = startOfWeek(d.date, { weekStartsOn: 1 })
    data[i]._rollUpDate = start.getTime()

    if (i == 0) {
      isIncompleteStart = isAfter(d.date, start)
      if (isIncompleteStart) {
        incompleteStartDate = d.date
      }
    }
    if (i === data.length - 1) {
      const end = endOfWeek(d.date, { weekStartsOn: 1 })
      isIncompleteEnd = isBefore(d.date, end)
      if (isIncompleteEnd) {
        incompleteEndDate = d.date
      }
    }
  })
  return rollUp(
    domains,
    data,
    isIncompleteStart,
    isIncompleteEnd,
    incompleteStartDate,
    incompleteEndDate
  )
}
