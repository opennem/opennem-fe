import process from './process'
import rollUp from './rollUp'
import summarise from './summarise'
import { filterDatasetByRange } from '@/data/helpers/filter'

export function dataProcess(data, range, interval) {
  const { domains, dataset, type } = process(data, range)

  const datasetFlat = filterDatasetByRange(dataset, range)
  const currentDataset = rollUp({
    domains,
    datasetFlat,
    interval,
    isEnergyType: type === 'energy'
  })
  const powerEnergyDomains = domains.filter(
    d => d.type === 'power' || d.type === 'energy'
  )

  summarise({
    currentDataset,
    domains: powerEnergyDomains
  })

  return {
    dataset: currentDataset,
    datasetFlat,
    units: powerEnergyDomains
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
