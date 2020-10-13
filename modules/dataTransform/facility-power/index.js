import process from './process'
import rollUp from './rollUp'
import summarise from './summarise'

export function dataProcess(data, range, interval) {
  const { domains, dataset, type } = process(data, range)
  const currentDataset = rollUp({
    domains,
    datasetFlat: dataset,
    interval,
    isEnergyType: type === 'energy'
  })

  summarise({
    currentDataset,
    domains
  })

  return {
    dataset: currentDataset,
    datasetFlat: dataset,
    units: domains
  }
}

export function dataRollUp(datasetFlat, domains, interval, isEnergyType) {
  return rollUp({
    domains,
    datasetFlat,
    interval,
    isEnergyType
  })
}
