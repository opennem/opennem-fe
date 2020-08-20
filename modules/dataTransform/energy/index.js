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
    domainMarketValue,
    domainPrice,
    domainPowerEnergy,
    domainTemperature,
    domainEmissions,
    type
  } = process(responses)

  const isEnergyType = type === 'energy'
  const dataset = filterDatasetByRange(datasetFlat, range)

  const currentDataset = rollUp({
    domains: [
      ...domainPowerEnergy,
      ...domainEmissions,
      ...domainMarketValue,
      ...domainPrice,
      ...domainTemperature
    ],
    datasetFlat: dataset,
    interval
  })
  const domainPowerEnergyGrouped = getAllGroups(domainPowerEnergy, type)
  const domainEmissionsGrouped = getAllGroups(domainEmissions, EMISSIONS)
  const domainMarketValueGrouped = getAllGroups(domainMarketValue, MARKET_VALUE)

  summariseDataset({
    isEnergyType,
    currentDataset,
    domainPowerEnergy,
    domainEmissions,
    domainPrice: isEnergyType ? domainMarketValue : domainPrice
  })
  groupDataset({
    dataset: currentDataset,
    domainPowerEnergyGrouped,
    domainEmissionsGrouped,
    domainMarketValueGrouped
  })

  return {
    dataType: type,
    datasetFlat: dataset,
    domainPowerEnergy,
    domainPowerEnergyGrouped,
    domainEmissions,
    domainEmissionsGrouped,
    domainMarketValue,
    domainMarketValueGrouped,
    domainPrice,
    domainTemperature,
    currentDataset
  }
}

export function dataRollUp({
  datasetFlat,
  domainPowerEnergy,
  domainPowerEnergyGrouped,
  domainEmissions,
  domainEmissionsGrouped,
  domainMarketValue,
  domainMarketValueGrouped,
  domainPrice,
  domainTemperature,
  range,
  interval,
  isEnergyType
}) {
  const currentDataset = rollUp({
    domains: [
      ...domainPowerEnergy,
      ...domainEmissions,
      ...domainMarketValue,
      ...domainTemperature
    ],
    datasetFlat: filterDatasetByRange(datasetFlat, range),
    interval
  })

  summariseDataset({
    isEnergyType,
    currentDataset,
    domainPowerEnergy,
    domainEmissions,
    domainPrice: isEnergyType ? domainMarketValue : domainPrice
  })
  groupDataset({
    dataset: currentDataset,
    domainPowerEnergyGrouped,
    domainEmissionsGrouped,
    domainMarketValueGrouped
  })

  return {
    currentDataset
  }
}

export function dataFilterByPeriod({ currentDataset, interval, period }) {
  return {
    filteredDatasetFlat: filterDatasetByPeriod(currentDataset, interval, period)
  }
}
