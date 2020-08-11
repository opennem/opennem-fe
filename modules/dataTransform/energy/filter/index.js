import subDays from 'date-fns/subDays'
import subMonths from 'date-fns/subMonths'

export default function(dataset, range) {
  if (range === '7D' || range === 'ALL') {
    return dataset // no need to filter
  }

  const latestDate = dataset[dataset.length - 1].date
  let newStartDate = null
  if (range === '1D') {
    newStartDate = subDays(latestDate, 1)
  } else if (range === '3D') {
    newStartDate = subDays(latestDate, 3)
  } else if (range === '30D') {
    newStartDate = subDays(latestDate, 29)
  } else if (range === '1Y') {
    newStartDate = subDays(latestDate, 365)
  }
  return dataset.filter(d => d.date >= newStartDate && d.date <= latestDate)
}
