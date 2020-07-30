import parseAndCheckData from '@/services/dataTransform/v2/parseAndCheckData.js'
import getFuelTechInOrder from '@/services/dataTransform/v2/getFuelTechInOrder.js'
import createEmptyDatasets from '@/services/dataTransform/v2/createEmptyDatasets.js'
import flattenAndInterpolate from '@/services/dataTransform/v2/flattenAndInterpolate.js'
import summariseDataset from '@/services/dataTransform/v2/summariseDataset.js'
import {
  getPowerEnergyDomains,
  getTemperatureDomains
} from '@/services/dataTransform/v2/getDomains.js'

import rollUp30m from '@/services/dataTransform/v2/rollUp/30m.js'

export function getFlatDataAndDomains(data) {
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
  summariseDataset(datasetAll, powerEnergyDomains)

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

export function rollUp({ domains, datasetAll, interval }) {
  switch (interval) {
    case '30m':
      return rollUp30m(domains, datasetAll)
    default:
      return datasetAll
  }
}
