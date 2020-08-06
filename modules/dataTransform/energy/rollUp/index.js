import rollUp30m from './30m.js'
import rollUpDay from './day.js'
import rollUpWeek from './week.js'
import rollUpMonth from './month.js'
import PerfTime from '@/plugins/perfTime.js'

const perfTime = new PerfTime()

export default function({ domains, datasetFlat, interval }) {
  perfTime.time()
  let rolled = datasetFlat
  switch (interval) {
    case '30m':
      rolled = rollUp30m(domains, datasetFlat)
      break
    case 'Day':
      rolled = rollUpDay(domains, datasetFlat)
      break
    case 'Week':
      rolled = rollUpWeek(domains, datasetFlat)
      break
    case 'Month':
      rolled = rollUpMonth(domains, datasetFlat)
      break
    default:
  }
  perfTime.timeEnd(`data.rollUp.${interval}`)
  return rolled
}
