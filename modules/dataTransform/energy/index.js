import process from './process'
import rollUp from './rollUp'
import summariseDataset from './summariseDataset.js'

export function dataProcess(data, interval) {
  const {
    datasetAll,
    datasetTemperature,
    powerEnergyDomains,
    temperatureDomains
  } = process(data)

  const energyDatasetByInterval = rollUp({
    domains: [...powerEnergyDomains, ...temperatureDomains],
    datasetAll,
    interval
  })

  summariseDataset(energyDatasetByInterval, powerEnergyDomains)

  return {
    datasetAll,
    datasetTemperature,
    powerEnergyDomains,
    temperatureDomains,
    energyDatasetByInterval
  }
}

export function dataRollUp(datasetAll, domains, interval) {
  const energyDatasetByInterval = rollUp({
    domains,
    datasetAll,
    interval
  })

  summariseDataset(energyDatasetByInterval, domains)

  return {
    energyDatasetByInterval
  }
}
