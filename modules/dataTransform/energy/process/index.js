import _cloneDeep from 'lodash.clonedeep'
import PerfTime from '@/plugins/perfTime.js'
import { EMISSIONS, MARKET_VALUE } from '@/constants/data-types'
import createEmptyDatasets from '@/modules/dataTransform/helpers/createEmptyDatasets.js'
import parseAndCheckData from './parseAndCheckData.js'
import flattenAndInterpolate from './flattenAndInterpolate.js'
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
  // combine multiple periods
  const firstResponse = responses[0]
  const data = _cloneDeep(firstResponse)
  responses.forEach((res, i) => {
    if (i > 0) {
      res.forEach(r => {
        const find = data.find(d => d.id === r.id)
        if (find) {
          find.history.last = r.history.last
          find.history.data = [...find.history.data, ...r.history.data]
        } else {
          // console.warn(`${r.id} is missing from other responses`)
          // create missing obj
          const missing = _cloneDeep(r)
          const newStart = firstResponse[0].history.start
          const newData = Array.from(
            Array(firstResponse[0].history.data.length),
            () => null
          )
          missing.history.start = newStart
          missing.history.data = [...newData, ...r.history.data]
          data.push(missing)
        }
      })
    }
  })

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
