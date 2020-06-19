import moment from 'moment'
import { timeYear } from 'd3-time'
import rollUp from './roll-up'
import { setStartOfYear } from './roll-up-helpers'

export default function(ids, energyDomains, data) {
  let nestDate = setStartOfYear(data[0].date)
  let isIncompleteEnd = false,
    isIncompleteStart = false

  data.forEach((d, i) => {
    nestDate = setStartOfYear(d.date)
    data[i].nestDate = nestDate.toDate()

    // also convert to TWh
    energyDomains.forEach(domain => {
      d[domain.id] = d[domain.id] / 1000
    })

    if (i === 0) {
      const startDate = moment(d.date).set('hour', 0)
      const startOfYear = timeYear.floor(d.date)
      isIncompleteStart = moment(startDate).isAfter(startOfYear)
    }

    if (i === data.length - 1) {
      const endDate = moment(d.date).set('hour', 0)
      const endOfYear = moment(timeYear.ceil(d.date)).subtract(1, 'day')
      isIncompleteEnd = moment(endDate).isBefore(endOfYear)
    }
  })

  return rollUp(ids, data, isIncompleteStart, isIncompleteEnd)
}
