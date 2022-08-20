import * as DT from '@/constants/data-types.js'
import {
  checkHistoryObject,
  checkPowerEnergyExists
} from '@/services/DataCheck.js'

export default function (response, displayTz) {
  const data = response.data || response
  const dataAll = [],
    dataPower = [],
    dataEnergy = [],
    dataPowerEnergy = [],
    dataEmissions = [],
    dataPriceMarketValue = [],
    dataTemperature = [],
    dataInflation = [],
    demandEnergy = [],
    demandMarketValue = []
  // filter out each type to its own array
  data.forEach((d) => {
    const typeProp = typeof d.data_type === 'undefined' ? 'type' : 'data_type'
    if (DT.isValidDataType(d[typeProp])) {
      dataAll.push(d)
    }

    switch (d.type) {
      case DT.POWER:
        // set demand as a separate series
        if (d.id.includes('demand')) {
          demandEnergy.push(d)
        } else {
          dataPower.push(d)
          dataPowerEnergy.push(d)
        }
        break
      case DT.ENERGY:
        // set demand as a separate series
        if (d.id.includes('demand')) {
          demandEnergy.push(d)
        } else {
          dataEnergy.push(d)
          dataPowerEnergy.push(d)
        }

        break
      case DT.DEMAND:
        break
      case DT.EMISSIONS:
        dataEmissions.push(d)
        break
      case DT.MARKET_VALUE:
      case DT.PRICE:
        // set demand as a separate series
        if (d.id.includes('demand')) {
          demandMarketValue.push(d)
        } else {
          dataPriceMarketValue.push(d)
        }
        break
      case DT.TEMPERATURE:
      case DT.TEMPERATURE_MIN:
      case DT.TEMPERATURE_MAX:
      case DT.TEMPERATURE_MEAN:
        dataTemperature.push(d)
        break
      case DT.CPI:
        dataInflation.push(d)
        break
      default:
        console.warn(`Unknown type in JSON response - ${d.type}`, d)
    }
  })

  checkPowerEnergyExists({ dataPower, dataEnergy })
  const isPowerData = dataPower.length > 0
  data.forEach((d) => {
    checkHistoryObject(d, displayTz, !isPowerData)
  })

  return {
    dataAll,
    dataPowerEnergy,
    dataEmissions,
    dataPriceMarketValue,
    dataTemperature,
    dataInflation,
    demandEnergy,
    demandMarketValue,
    isPowerData,
    hasPowerEnergyData: dataPowerEnergy.length > 0,
    fuelTechDataType: isPowerData ? DT.POWER : DT.ENERGY,
    units: dataPowerEnergy.length > 0 ? dataPowerEnergy[0].units : ''
  }
}
