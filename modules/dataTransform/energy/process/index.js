import parseAndCheckData from './parseAndCheckData.js'
import getFuelTechInOrder from './getFuelTechInOrder.js'
import createEmptyDatasets from './createEmptyDatasets.js'
import flattenAndInterpolate from './flattenAndInterpolate.js'
import { getPowerEnergyDomains, getTemperatureDomains } from './getDomains.js'

export default function(data) {
  const {
    dataAll,
    dataPowerEnergy,
    temperatureIds,
    fuelTechDataType,
    isPowerData,
    hasPowerEnergyData
  } = parseAndCheckData(data)

  const fuelTechIdTypes = getFuelTechInOrder(dataPowerEnergy)
  const domainPowerEnergy = getPowerEnergyDomains(
    fuelTechIdTypes,
    fuelTechDataType
  )
  const domainTemperature = getTemperatureDomains(temperatureIds)
  const dataInterval = hasPowerEnergyData
    ? dataPowerEnergy[0].history.interval
    : null
  const datasetFlat = createEmptyDatasets(dataPowerEnergy)
  flattenAndInterpolate(isPowerData, dataInterval, dataAll, datasetFlat)

  return {
    datasetFlat,
    domainPowerEnergy,
    domainTemperature,
    type: isPowerData ? 'power' : 'energy'
  }
}
