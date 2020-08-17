import { getAllGroups } from '@/constants/v2/groups'
import { EMISSIONS } from '@/constants/v2/data-types'
import process from './process'
import rollUp from './rollUp'
import summariseDataset from './summarise'
import groupDataset from './group'
import { filterDatasetByRange, filterDatasetByPeriod } from './filter'

export function dataProcess(responses, range, interval) {
  const {
    datasetFlat,
    domainPriceMarketValue,
    domainVolWeightedPriceDomains,
    domainPowerEnergy,
    domainTemperature,
    domainEmissions,
    type
  } = process(responses)

  const dataset = filterDatasetByRange(datasetFlat, range)

  const currentDatasetFlat = rollUp({
    domains: [
      ...domainPowerEnergy,
      ...domainEmissions,
      ...domainPriceMarketValue,
      ...domainTemperature
    ],
    datasetFlat: dataset,
    interval
  })
  const domainPowerEnergyGrouped = getAllGroups(domainPowerEnergy, type)
  const domainEmissionsGrouped = getAllGroups(domainEmissions, EMISSIONS)

  summariseDataset({
    currentDatasetFlat,
    domainPowerEnergy,
    domainEmissions,
    domainPriceMarketValue
  })
  groupDataset(
    currentDatasetFlat,
    domainPowerEnergyGrouped,
    domainEmissionsGrouped
  )

  return {
    dataType: type,
    datasetFlat: dataset,
    domainPowerEnergy,
    domainPowerEnergyGrouped,
    domainEmissions,
    domainEmissionsGrouped,
    domainPriceMarketValue,
    domainVolWeightedPriceDomains,
    domainTemperature,
    currentDatasetFlat
  }
}

export function dataRollUp({
  datasetFlat,
  domainPowerEnergy,
  domainPowerEnergyGrouped,
  domainEmissions,
  domainEmissionsGrouped,
  domainPriceMarketValue,
  domainTemperature,
  range,
  interval
}) {
  const currentDatasetFlat = rollUp({
    domains: [
      ...domainPowerEnergy,
      ...domainEmissions,
      ...domainPriceMarketValue,
      ...domainTemperature
    ],
    datasetFlat: filterDatasetByRange(datasetFlat, range),
    interval
  })

  summariseDataset({
    currentDatasetFlat,
    domainPowerEnergy,
    domainEmissions,
    domainPriceMarketValue
  })
  groupDataset(
    currentDatasetFlat,
    domainPowerEnergyGrouped,
    domainEmissionsGrouped
  )

  return {
    currentDatasetFlat
  }
}

export function dataFilterByPeriod({ currentDatasetFlat, interval, period }) {
  return {
    filteredDatasetFlat: filterDatasetByPeriod(
      currentDatasetFlat,
      interval,
      period
    )
  }
}
