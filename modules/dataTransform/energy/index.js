import { getAllGroups } from '@/constants/v2/groups'
import process from './process'
import rollUp from './rollUp'
import summariseDataset from './summarise'
import groupDataset from './group'
import filterDatasetByRange from './filter'

export function dataProcess(responses, range, interval) {
  const {
    datasetFlat,
    datasetTemperature,
    domainPowerEnergy,
    domainTemperature,
    type
  } = process(responses)
  const dataset = filterDatasetByRange(datasetFlat, range)
  const currentDatasetFlat = rollUp({
    domains: [...domainPowerEnergy, ...domainTemperature],
    datasetFlat: dataset,
    interval
  })
  const domainPowerEnergyGrouped = getAllGroups(domainPowerEnergy, type)

  summariseDataset(currentDatasetFlat, domainPowerEnergy)
  groupDataset(currentDatasetFlat, domainPowerEnergyGrouped)

  return {
    dataType: type,
    datasetFlat: dataset,
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
  range,
  interval
) {
  const currentDatasetFlat = rollUp({
    domains,
    datasetFlat: filterDatasetByRange(datasetFlat, range),
    interval
  })

  summariseDataset(currentDatasetFlat, domains)
  groupDataset(currentDatasetFlat, domainPowerEnergyGrouped)

  return {
    currentDatasetFlat
  }
}
