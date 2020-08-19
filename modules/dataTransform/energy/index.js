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

  const currentDatasetFlat = rollUp({
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
    currentDatasetFlat,
    domainPowerEnergy,
    domainEmissions,
    domainPrice: isEnergyType ? domainMarketValue : domainPrice
  })
  groupDataset({
    dataset: currentDatasetFlat,
    domainPowerEnergyGrouped,
    domainEmissionsGrouped,
    domainMarketValueGrouped
  })

  console.log(currentDatasetFlat)

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
    currentDatasetFlat
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
  const currentDatasetFlat = rollUp({
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
    currentDatasetFlat,
    domainPowerEnergy,
    domainEmissions,
    domainPrice: isEnergyType ? domainMarketValue : domainPrice
  })
  groupDataset({
    dataset: currentDatasetFlat,
    domainPowerEnergyGrouped,
    domainEmissionsGrouped,
    domainMarketValueGrouped
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
