import timeGroup30m from '@/modules/dataTransform/helpers/time-groups/30m.js'
import timeGroupDay from '@/modules/dataTransform/helpers/time-groups/day.js'
import timeGroupWeek from '@/modules/dataTransform/helpers/time-groups/week.js'
import timeGroupMonth from '@/modules/dataTransform/helpers/time-groups/month.js'
import timeGroupSeason from '@/modules/dataTransform/helpers/time-groups/season.js'
import timeGroupQuarter from '@/modules/dataTransform/helpers/time-groups/quarter.js'
import timeGroupYearHalf from '@/modules/dataTransform/helpers/time-groups/yearHalf.js'
import timeGroupYearFin from '@/modules/dataTransform/helpers/time-groups/yearFin.js'
import timeGroupYear from '@/modules/dataTransform/helpers/time-groups/year.js'
import PerfTime from '@/plugins/perfTime.js'
import energyRollUp from './energyRollUp'
import powerRollUp from './powerRollUp'

const perfTime = new PerfTime()

export default function({ domains, datasetFlat, interval }) {
  perfTime.time()
  let rolled = datasetFlat
  switch (interval) {
    case '30m':
      rolled = timeGroup30m(domains, datasetFlat, powerRollUp)
      break
    case 'Day':
      rolled = timeGroupDay(domains, datasetFlat, energyRollUp)
      break
    case 'Week':
      rolled = timeGroupWeek(domains, datasetFlat, energyRollUp)
      break
    case 'Month':
      rolled = timeGroupMonth(domains, datasetFlat, energyRollUp)
      break
    case 'Season':
      rolled = timeGroupSeason(domains, datasetFlat, energyRollUp)
      break
    case 'Quarter':
      rolled = timeGroupQuarter(domains, datasetFlat, energyRollUp)
      break
    case 'Half Year':
      rolled = timeGroupYearHalf(domains, datasetFlat, energyRollUp)
      break
    case 'Fin Year':
      rolled = timeGroupYearFin(domains, datasetFlat, energyRollUp)
      break
    case 'Year':
      rolled = timeGroupYear(domains, datasetFlat, energyRollUp)
      break
    default:
  }
  perfTime.timeEnd(`--- data.rollUp.${interval}`)
  return rolled
}
