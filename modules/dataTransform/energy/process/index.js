import parseAndCheckData from './parseAndCheckData.js'
import getFuelTechInOrder from './getFuelTechInOrder.js'
import createEmptyDatasets from './createEmptyDatasets.js'
import flattenAndInterpolate from './flattenAndInterpolate.js'
import { getPowerEnergyDomains, getTemperatureDomains } from './getDomains.js'

export default function(data) {
  const {
    dataAll,
    dataPowerEnergy,
    dataTemperature,
    temperatureIds,
    fuelTechDataType,
    isPowerData,
    hasPowerEnergyData
  } = parseAndCheckData(data)

  const fuelTechIdTypes = getFuelTechInOrder(dataPowerEnergy)
  const powerEnergyDomains = getPowerEnergyDomains(
    fuelTechIdTypes,
    fuelTechDataType
  )
  const temperatureDomains = getTemperatureDomains(temperatureIds)
  const dataInterval = hasPowerEnergyData
    ? dataPowerEnergy[0].history.interval
    : null
  const { datasetAll, datasetTemperature } = createEmptyDatasets(
    dataPowerEnergy
  )
  flattenAndInterpolate(isPowerData, dataInterval, dataAll, datasetAll)

  // dataTemperature.forEach(d => {
  //   const historyData = d.history.data
  //   // 30m interval
  //   let index = 0
  //   datasetTemperature.forEach((h, i) => {
  //     h[d.id] =
  //       typeof historyData[index] === 'undefined' ? null : historyData[index]
  //     if (i !== 0) {
  //       if (i % 6 === 0) {
  //         index += 1
  //       }
  //     }
  //   })
  // })

  // console.log(dataset.length, num, fuelTechIdTypes)
  // console.log(datasetAll)

  return {
    datasetAll,
    datasetTemperature,
    powerEnergyDomains,
    temperatureDomains
  }
}
