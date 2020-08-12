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
    domainPriceMarketValue,
    domainVolWeightedPriceDomains,
    domainPowerEnergy,
    domainTemperature,
    type
  } = process(responses)

  const dataset = filterDatasetByRange(datasetFlat, range)
  const currentDatasetFlat = rollUp({
    domains: [
      ...domainPowerEnergy,
      ...domainPriceMarketValue,
      ...domainTemperature
    ],
    datasetFlat: dataset,
    interval
  })
  const domainPowerEnergyGrouped = getAllGroups(domainPowerEnergy, type)

  summariseDataset(
    currentDatasetFlat,
    domainPowerEnergy,
    domainPriceMarketValue
  )
  groupDataset(currentDatasetFlat, domainPowerEnergyGrouped)

  return {
    dataType: type,
    datasetFlat: dataset,
    datasetTemperature,
    domainPowerEnergy,
    domainPriceMarketValue,
    domainVolWeightedPriceDomains,
    domainTemperature,
    currentDatasetFlat,

    domainPowerEnergyGrouped
  }
}

export function dataRollUp({
  datasetFlat,
  domainPowerEnergy,
  domainPriceMarketValue,
  domainTemperature,
  domainPowerEnergyGrouped,
  range,
  interval
}) {
  const currentDatasetFlat = rollUp({
    domains: [
      ...domainPowerEnergy,
      ...domainPriceMarketValue,
      ...domainTemperature
    ],
    datasetFlat: filterDatasetByRange(datasetFlat, range),
    interval
  })

  summariseDataset(
    currentDatasetFlat,
    domainPowerEnergy,
    domainPriceMarketValue
  )
  groupDataset(currentDatasetFlat, domainPowerEnergyGrouped)

  return {
    currentDatasetFlat
  }
}
