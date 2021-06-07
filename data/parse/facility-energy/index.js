import process from './process'
import rollUp from './rollUp'
import summarise from './summarise'
import {
  filterDatasetByRange,
  filterDatasetByPeriod
} from '@/data/helpers/filter'

export function dataProcess(data, range, interval, displayTz) {
  const {
    dataset,
    domainPowerEnergy,
    domainEmissions,
    domainMarketValue,
    isEnergyType
  } = process(data, displayTz)

  const filtered = filterDatasetByRange(dataset, range)
  const domains = [
    ...domainPowerEnergy,
    ...domainEmissions,
    ...domainMarketValue
  ]

  const currentDataset = rollUp({
    domains,
    datasetFlat: filtered,
    interval,
    isEnergyType
  })

  summarise({
    isEnergyType,
    currentDataset,
    domainPowerEnergy,
    domainEmissions,
    domainMarketValue
  })

  return {
    dataset: currentDataset,
    datasetFlat: filtered,
    domainPowerEnergy,
    domainEmissions,
    domainMarketValue
  }
}

export function dataRollUp({
  datasetFlat,
  domainPowerEnergy,
  domainEmissions,
  domainMarketValue,
  interval,
  isEnergyType
}) {
  const domains = [
    ...domainPowerEnergy,
    ...domainEmissions,
    ...domainMarketValue
  ]

  const currentDataset = rollUp({
    domains,
    datasetFlat,
    interval,
    isEnergyType
  })

  summarise({
    isEnergyType,
    currentDataset,
    domainPowerEnergy,
    domainEmissions,
    domainMarketValue
  })
  return currentDataset
}

export function dataFilterByPeriod({ dataset, interval, period }) {
  return filterDatasetByPeriod(dataset, interval, period)
}
