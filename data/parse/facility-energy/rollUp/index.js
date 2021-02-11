import timeGroups from '@/data/helpers/time-groups'
import powerRollUp from '@/data/parse/region-energy/rollUp/powerRollUp'
import energyRollUp from '@/data/parse/region-energy/rollUp/energyRollUp'

export default function({ domains, datasetFlat, interval, isEnergyType }) {
  return timeGroups({
    domains,
    datasetFlat,
    interval,
    rollUp: isEnergyType ? energyRollUp : powerRollUp
  })
}
