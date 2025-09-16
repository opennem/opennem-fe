import timeGroups from '@/data/helpers/time-groups'
import capacityRollUp from './capacity.js'

export default function ({ domains, datasetFlat, interval }) {
  return timeGroups({
    domains,
    datasetFlat,
    interval,
    rollUp: capacityRollUp
  })
}
