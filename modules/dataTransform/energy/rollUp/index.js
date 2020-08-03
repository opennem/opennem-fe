import rollUp30m from './30m.js'
import rollUpDay from './day.js'
import rollUpWeek from './week.js'
import rollUpMonth from './month.js'

export default function({ domains, datasetFlat, interval }) {
  switch (interval) {
    case '30m':
      return rollUp30m(domains, datasetFlat)
    case 'Day':
      return rollUpDay(domains, datasetFlat)
    case 'Week':
      return rollUpWeek(domains, datasetFlat)
    case 'Month':
      return rollUpMonth(domains, datasetFlat)
    default:
      return datasetFlat
  }
}
