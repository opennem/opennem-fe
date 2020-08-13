import * as DT from '@/constants/v2/data-types.js'
import { checkPowerEnergyExists } from '@/services/DataCheck.js'

export default function(response) {
  const data = response.data || response
  const dataAll = [],
    dataPower = [],
    dataEnergy = [],
    dataPowerEnergy = [],
    dataEmissions = [],
    dataPriceMarketValue = [],
    dataTemperature = []
  // filter out each type to its own array
  data.forEach(d => {
    if (DT.isValidDataType(d.type)) {
      dataAll.push(d)
    }
    switch (d.type) {
      case DT.POWER:
        dataPower.push(d)
        dataPowerEnergy.push(d)
        break
      case DT.ENERGY:
        dataEnergy.push(d)
        dataPowerEnergy.push(d)
        break
      case DT.DEMAND:
        break
      case DT.EMISSIONS:
        dataEmissions.push(d)
        break
      case DT.MARKET_VALUE:
      case DT.PRICE:
        dataPriceMarketValue.push(d)
        break
      case DT.TEMPERATURE:
      case DT.TEMPERATURE_MIN:
      case DT.TEMPERATURE_MAX:
      case DT.TEMPERATURE_MEAN:
        dataTemperature.push(d)
        break
      default:
        console.warn(`Unknown type in JSON response - ${d.type}`, d)
    }
  })

  checkPowerEnergyExists({ dataPower, dataEnergy })

  return {
    dataAll,
    dataPowerEnergy,
    dataEmissions,
    dataPriceMarketValue,
    dataTemperature,
    isPowerData: dataPower.length > 0,
    hasPowerEnergyData: dataPowerEnergy.length > 0,
    fuelTechDataType: dataPower.length > 0 ? DT.POWER : DT.ENERGY
  }
}
