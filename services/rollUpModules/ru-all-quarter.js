import moment from 'moment'
import rollUp from './roll-up'

// Quarters
function getStartMonth(month) {
  switch (month) {
    case 0:
    case 1:
    case 2:
      return 0

    case 3:
    case 4:
    case 5:
      return 3

    case 6:
    case 7:
    case 8:
      return 6

    case 9:
    case 10:
    case 11:
      return 9

    default:
  }
  return null
}

function setStartMonth(date, qMonth) {
  const d = moment(date)
  d.set('month', qMonth)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export default function(ids, data) {
  let currentMonth = moment(data[0].date).month()
  let nestDate = setStartMonth(data[0].date, getStartMonth(currentMonth))

  data.forEach((d, i) => {
    const q = moment(d.date).month()
    nestDate = setStartMonth(d.date, getStartMonth(q))
    data[i].nestDate = nestDate.toDate()
  })

  return rollUp(ids, data)
}
