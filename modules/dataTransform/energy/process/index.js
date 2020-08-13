import PerfTime from '@/plugins/perfTime.js'
import parseAndCheckData from './parseAndCheckData.js'
import createEmptyDatasets from './createEmptyDatasets.js'
import flattenAndInterpolate from './flattenAndInterpolate.js'
import {
  getFuelTechInOrder,
  getPowerEnergyDomains,
  getEmissionsDomains,
  getTemperatureDomains,
  getPriceDomains,
  getVolWeightedPriceDomains
} from './getDomains.js'

const perfTime = new PerfTime()

export default function(responses) {
  perfTime.time()
  // combine multiple periods
  const data = responses[0]
  responses.forEach((res, i) => {
    if (i > 0) {
      res.forEach(r => {
        const find = data.find(d => d.id === r.id)
        if (find) {
          find.history.last = r.history.last
          find.history.data = [...find.history.data, ...r.history.data]
        } else {
          // TODO: create new object with matching start, last and data count
          // data.push(r)
          console.warn(`${r.id} is missing from other responses`)
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
    hasPowerEnergyData
  } = parseAndCheckData(data)

  const fuelTechIdTypes = getFuelTechInOrder(dataPowerEnergy)
  const domainPowerEnergy = getPowerEnergyDomains(
    fuelTechIdTypes,
    fuelTechDataType
  )
  const domainEmissions = getEmissionsDomains(dataEmissions)
  const domainPriceMarketValue = getPriceDomains(dataPriceMarketValue)
  const domainVolWeightedPriceDomains = getVolWeightedPriceDomains()
  const domainTemperature = getTemperatureDomains(dataTemperature)
  const dataInterval = hasPowerEnergyData
    ? dataPowerEnergy[0].history.interval
    : null
  const datasetFlat = createEmptyDatasets(dataPowerEnergy)
  flattenAndInterpolate(isPowerData, dataInterval, dataAll, datasetFlat)

  perfTime.timeEnd('data.process')
  return {
    datasetFlat,
    domainPowerEnergy,
    domainEmissions,
    domainPriceMarketValue,
    domainVolWeightedPriceDomains,
    domainTemperature,
    type: isPowerData ? 'power' : 'energy'
  }
}
