import PerfTime from '@/plugins/perfTime.js'
import { EMISSIONS, MARKET_VALUE } from '@/constants/data-types'
import createEmptyDatasets from '@/modules/dataTransform/helpers/createEmptyDatasets.js'
import parseAndCheckData from './parseAndCheckData.js'
import flattenAndInterpolate from './flattenAndInterpolate.js'
import combineMultipleResponses from './combineMultipleResponses.js'
import {
  getFuelTechWithTypeDomains,
  getFuelTechInOrder,
  getFuelTechDomains,
  getTemperatureDomains,
  getPriceDomains,
  getVolWeightedPriceDomains
} from './getDomains.js'

const perfTime = new PerfTime()

export default function(responses) {
  perfTime.time()

  const data = combineMultipleResponses(responses)

  const {
    dataAll,
    dataPowerEnergy,
    dataEmissions,
    dataPriceMarketValue,
    dataTemperature,
    fuelTechDataType,
    isPowerData,
    hasPowerEnergyData,
    units
  } = parseAndCheckData(data)

  const dataPowerEnergyInterval =
    dataPowerEnergy.length > 0
      ? dataPowerEnergy[0].history
        ? dataPowerEnergy[0].history.interval
        : null
      : null

  const hasPriceMarketValue = dataPriceMarketValue.length > 0
  const fuelTechIdTypes = getFuelTechInOrder(dataPowerEnergy)

  const domainPowerEnergy = getFuelTechDomains(
    fuelTechIdTypes,
    fuelTechDataType
  )
  const domainEmissions = getFuelTechDomains(
    getFuelTechInOrder(dataEmissions),
    EMISSIONS
  )

  let domainMarketValue = [],
    domainPrice = []
  if (hasPriceMarketValue) {
    domainMarketValue = isPowerData
      ? getFuelTechWithTypeDomains(fuelTechIdTypes, MARKET_VALUE)
      : getFuelTechDomains(
          getFuelTechInOrder(dataPriceMarketValue),
          MARKET_VALUE
        )
    domainPrice = isPowerData
      ? getPriceDomains(dataPriceMarketValue)
      : getVolWeightedPriceDomains()
  } else {
    console.warn('There is no price or market value in this dataset')
  }

  const domainTemperature = getTemperatureDomains(dataTemperature)

  const dataInterval = hasPowerEnergyData
    ? dataPowerEnergy[0].history.interval
    : null

  const datasetFlat = createEmptyDatasets(dataPowerEnergy)

  flattenAndInterpolate(isPowerData, dataInterval, dataAll, datasetFlat)

  perfTime.timeEnd('--- data.process')

  return {
    datasetFlat,
    domainPowerEnergy,
    domainEmissions,
    domainMarketValue,
    domainPrice,
    domainTemperature,
    dataPowerEnergyInterval,
    type: isPowerData ? 'power' : 'energy',
    units
  }
}
