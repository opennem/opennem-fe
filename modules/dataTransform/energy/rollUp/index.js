import rollUp30m from './30m.js'
import rollUpDay from './day.js'
import rollUpWeek from './week.js'
import rollUpMonth from './month.js'
import rollUpSeason from './season.js'
import rollUpQuarter from './quarter.js'
import rollUpYearHalf from './yearHalf.js'
import rollUpYearFin from './yearFin.js'
import rollUpYear from './year.js'
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
    case 'Season':
      rolled = rollUpSeason(domains, datasetFlat)
      break
    case 'Quarter':
      rolled = rollUpQuarter(domains, datasetFlat)
      break
    case 'Half Year':
      rolled = rollUpYearHalf(domains, datasetFlat)
      break
    case 'Fin Year':
      rolled = rollUpYearFin(domains, datasetFlat)
      break
    case 'Year':
      rolled = rollUpYear(domains, datasetFlat)
      break
    default:
  }
  perfTime.timeEnd(`--- data.rollUp.${interval}`)
  return rolled
}
