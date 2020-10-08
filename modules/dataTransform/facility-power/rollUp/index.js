import timeGroups from '@/modules/dataTransform/helpers/time-groups'
import powerRollUp from './powerRollUp'

export default function({ domains, datasetFlat, interval }) {
  return timeGroups({
    domains,
    datasetFlat,
    interval,
    rollUp: powerRollUp
  })
}
