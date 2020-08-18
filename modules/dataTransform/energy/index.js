import { getAllGroups } from '@/constants/v2/groups'
import { EMISSIONS, MARKET_VALUE } from '@/constants/v2/data-types'
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
  const domainPriceMarketValueGrouped = getAllGroups(
    domainPriceMarketValue,
    MARKET_VALUE
  )

  summariseDataset({
    isEnergyType: type === 'energy',
    currentDatasetFlat,
    domainPowerEnergy,
    domainEmissions,
    domainPriceMarketValue
  })
  groupDataset({
    dataset: currentDatasetFlat,
    domainPowerEnergyGrouped,
    domainEmissionsGrouped,
    domainPriceMarketValueGrouped
  })

  console.log(currentDatasetFlat)

  return {
    dataType: type,
    datasetFlat: dataset,
    domainPowerEnergy,
    domainPowerEnergyGrouped,
    domainEmissions,
    domainEmissionsGrouped,
    domainPriceMarketValue,
    domainPriceMarketValueGrouped,
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
  domainPriceMarketValueGrouped,
  domainTemperature,
  range,
  interval,
  isEnergyType
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
    isEnergyType,
    currentDatasetFlat,
    domainPowerEnergy,
    domainEmissions,
    domainPriceMarketValue
  })
  groupDataset({
    dataset: currentDatasetFlat,
    domainPowerEnergyGrouped,
    domainEmissionsGrouped,
    domainPriceMarketValueGrouped
  })

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
