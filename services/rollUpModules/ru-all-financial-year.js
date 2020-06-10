import moment from 'moment'
import { timeMonth } from 'd3-time'
import rollUp from './roll-up'
import { setStartOfMonth, setEndOfMonth, getFQ } from './roll-up-helpers'

export default function(ids, energyDomains, data) {
  let currentQ = moment(data[0].date).quarter()
  let nestDate = setStartOfMonth(data[0].date, getFQ(currentQ))
  let isIncompleteEnd = false,
    isIncompleteStart = false

  data.forEach((d, i) => {
    const q = moment(d.date).quarter()
    if (currentQ === 2 && q === 3) {
      nestDate = setStartOfMonth(d.date, getFQ(q))
    }
    currentQ = q
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
      const endOfFY = setEndOfMonth(
        moment(timeMonth.every(12).ceil(d.date)).subtract(1, 'day')
      )
      isIncompleteEnd = moment(endDate).isBefore(endOfFY)
    }
  })

  return rollUp(ids, data, isIncompleteStart, isIncompleteEnd)
}
