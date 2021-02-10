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
    currentDataset,
    domains
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
