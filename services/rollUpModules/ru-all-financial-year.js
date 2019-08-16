import moment from 'moment'
import rollUp from './roll-up'

function getQuarterStartMonth(quarter) {
  switch (quarter) {
    case 1:
      return 0
    case 2:
      return 3
    case 3:
      return 6
    case 4:
      return 9
    default:
  }
  return null
}

function setStartFY(date, qMonth) {
  const d = moment(date)
  d.set('month', qMonth)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export default function(ids, energyDomains, data) {
  let currentQ = moment(data[0].date).quarter()
  let nestDate = setStartFY(data[0].date, getQuarterStartMonth(currentQ))

  data.forEach((d, i) => {
    const q = moment(d.date).quarter()
    if (currentQ === 2 && q === 3) {
      nestDate = setStartFY(d.date, getQuarterStartMonth(q))
    }
    currentQ = q
    data[i].nestDate = nestDate.toDate()

    // also convert to TWh
    energyDomains.forEach(domain => {
      d[domain.id] = d[domain.id] / 1000
    })
  })

  return rollUp(ids, data)
}
