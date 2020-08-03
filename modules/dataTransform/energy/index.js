import { getAllGroups } from '@/constants/v2/groups'
import process from './process'
import rollUp from './rollUp'
import summariseDataset from './summarise'
import groupDataset from './group'

export function dataProcess(data, interval, groupName) {
  const {
    datasetAll,
    datasetTemperature,
    powerEnergyDomains,
    temperatureDomains,
    type
  } = process(data)
  const energyDatasetByInterval = rollUp({
    domains: [...powerEnergyDomains, ...temperatureDomains],
    datasetAll,
    interval
  })
  const domainPowerEnergyGrouped = getAllGroups(powerEnergyDomains, type)
  summariseDataset(energyDatasetByInterval, powerEnergyDomains)
  groupDataset(energyDatasetByInterval, domainPowerEnergyGrouped)

  return {
    datasetAll,
    datasetTemperature,
    powerEnergyDomains,
    temperatureDomains,
    energyDatasetByInterval,

    domainPowerEnergyGrouped
  }
}

export function dataRollUp(
  datasetAll,
  domains,
  domainPowerEnergyGrouped,
  interval
) {
  const energyDatasetByInterval = rollUp({
    domains,
    datasetAll,
    interval
  })

  summariseDataset(energyDatasetByInterval, domains)
  groupDataset(energyDatasetByInterval, domainPowerEnergyGrouped)

  return {
    energyDatasetByInterval
  }
}
