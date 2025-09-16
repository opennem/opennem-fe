import { rollups } from 'd3-array'

function reducer(a, domains) {
  let obj = {}

  domains.forEach((domain) => {
    const id = domain.id
    obj[id] = a[a.length - 1][id]
  })

  return obj
}

// Helper function to check if a date is the last day of the month
function isLastDayOfMonth(date) {
  const nextDay = new Date(date)
  nextDay.setDate(date.getDate() + 1)
  return nextDay.getDate() === 1
}

export default function (domains, data, isIncompleteStart,
  isIncompleteEnd,
  incompleteStartDate,
  incompleteEndDate,
  interval) {
  const entries = rollups(
    data,
    (v) => reducer(v, domains),
    (d) => d._rollUpDate
  )

  return entries.map((e, i) => {
    const object = {
      time: e[0],
      date: new Date(e[0])
    }

    Object.keys(e[1]).forEach((k) => {
      object[k] = e[1][k]
    })

    if (i === 0 && isIncompleteStart) {
      object._isIncompleteBucket = isIncompleteStart
      object._incompleteDate = incompleteStartDate
    }
    if (i === entries.length - 1 && isIncompleteEnd) {
      object._isIncompleteBucket = isIncompleteEnd
      object._incompleteDate = incompleteEndDate
    } 

    if (interval === 'month') {
      const now = new Date()
      const dataDate = new Date(e[0])
      
      // Check if the data date is in the current month and year
      if (now.getMonth() === dataDate.getMonth() && now.getFullYear() === dataDate.getFullYear()) {        
        // Check if today is the last day of the month
        if (isLastDayOfMonth(now)) {
          object._isIncompleteBucket = false
          object._incompleteDate = null
        } else {
          object._isIncompleteBucket = true
          object._incompleteDate = dataDate
        }
      }
    }

    return object
  })
}
