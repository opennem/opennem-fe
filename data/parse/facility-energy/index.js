import process from './process'
import rollUp from './rollUp'
import summarise from './summarise'
import { filterDatasetByRange } from '@/data/helpers/filter'

export function dataProcess(data, range, interval) {
  const {
    dataset,
    domainPowerEnergy,
    domainEmissions,
    domainMarketValue,
    isEnergyType
  } = process(data)

  const filtered = filterDatasetByRange(dataset, range)

  const currentDataset = rollUp({
    domains: domainPowerEnergy,
    datasetFlat: filtered,
    interval,
    isEnergyType
  })

  summarise({
    currentDataset,
    domains: domainPowerEnergy
  })

  return {
    dataset: currentDataset,
    datasetFlat: filtered,
    domainPowerEnergy,
    domainEmissions,
    domainMarketValue
  }
}

export function dataRollUp(datasetFlat, domains, interval, isEnergyType) {
  const currentDataset = rollUp({
    domains,
    datasetFlat,
    interval,
    isEnergyType
  })

  summarise({
    currentDataset,
    domains
  })
  return currentDataset
}
