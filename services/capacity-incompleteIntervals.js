import addWeeks from 'date-fns/addWeeks'
import addMonths from 'date-fns/addMonths'
import addQuarters from 'date-fns/addQuarters'
import addYears from 'date-fns/addYears'

export default function ({ dataset, range, interval, filterPeriod }) {
  const incompletes = []
  const filtered = dataset.filter((d) => d._isIncompleteBucket)

  filtered.forEach((f) => {
    if (interval === 'Week') {
      incompletes.push({
        start: f.date,
        end: addWeeks(f.date, 1)
      })
    }
    if (interval === 'Month') {
      incompletes.push({
        start: f.date,
        end: addMonths(f.date, 1)
      })
    }
    if (interval === 'Season') {
      incompletes.push({
        start: f.date,
        end: filterPeriod === 'All' ? addMonths(f.date, 3) : addYears(f.date, 1)
      })
    }
    if (interval === 'Quarter') {
      incompletes.push({
        start: f.date,
        end:
          filterPeriod === 'All' ? addQuarters(f.date, 1) : addYears(f.date, 1)
      })
    }
    if (interval === 'Half Year') {
      incompletes.push({
        start: f.date,
        end: filterPeriod === 'All' ? addMonths(f.date, 6) : addYears(f.date, 1)
      })
    }
    if (interval === 'Year' || interval === 'Fin Year') {
      incompletes.push({
        start: f.date,
        end: addYears(f.date, 1)
      })
    }
  })
  return incompletes
}
