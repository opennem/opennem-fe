import { getAllGroups } from '@/constants/v2/groups'
import process from './process'
import rollUp from './rollUp'
import summariseDataset from './summarise'
import groupDataset from './group'

export function dataProcess(responses, interval) {
  const {
    datasetFlat,
    datasetTemperature,
    domainPowerEnergy,
    domainTemperature,
    type
  } = process(responses)
  const currentDatasetFlat = rollUp({
    domains: [...domainPowerEnergy, ...domainTemperature],
    datasetFlat,
    interval
  })
  const domainPowerEnergyGrouped = getAllGroups(domainPowerEnergy, type)
  summariseDataset(currentDatasetFlat, domainPowerEnergy)
  groupDataset(currentDatasetFlat, domainPowerEnergyGrouped)

  return {
    dataType: type,
    datasetFlat,
    datasetTemperature,
    domainPowerEnergy,
    domainTemperature,
    currentDatasetFlat,

    domainPowerEnergyGrouped
  }
}

export function dataRollUp(
  datasetFlat,
  domains,
  domainPowerEnergyGrouped,
  interval
) {
  const currentDatasetFlat = rollUp({
    domains,
    datasetFlat,
    interval
  })

  summariseDataset(currentDatasetFlat, domains)
  groupDataset(currentDatasetFlat, domainPowerEnergyGrouped)

  return {
    currentDatasetFlat
  }
}
