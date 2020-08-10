import * as DT from '@/constants/v2/data-types.js'
import { checkPowerEnergyExists } from '@/services/DataCheck.js'

export default function(response) {
  const data = response.data || response
  const dataAll = [],
    dataPower = [],
    dataEnergy = [],
    dataPowerEnergy = [],
    dataTemperature = [],
    temperatureIds = []
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
      case DT.EMISSIONS:
      case DT.MARKET_VALUE:
      case DT.PRICE:
        break
      case DT.TEMPERATURE_MIN:
      case DT.TEMPERATURE_MAX:
        temperatureIds.push(d.id)
        break
      case DT.TEMPERATURE:
      case DT.TEMPERATURE_MEAN:
        dataTemperature.push(d)
        temperatureIds.push(d.id)
        break
      default:
        console.warn(`Parsing json error: unknown data type found - ${d.type}`)
    }
  })

  checkPowerEnergyExists({ dataPower, dataEnergy })

  return {
    dataAll,
    dataPowerEnergy,
    dataTemperature,
    temperatureIds,
    isPowerData: dataPower.length > 0,
    hasPowerEnergyData: dataPowerEnergy.length > 0,
    fuelTechDataType: dataPower.length > 0 ? DT.POWER : DT.ENERGY
  }
}
