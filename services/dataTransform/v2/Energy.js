import * as FT from '@/constants/fuel-tech.js'
import * as DT from '@/constants/v2/data-types.js'
import {
  checkPowerEnergyExists,
  getStartEndNumInterval,
  incrementTime
} from '@/services/DataCheck.js'
import rollUp30m from '@/services/rollUp/30m.js'

export function flattenAndInterpolate(data) {
  const dataPower = [],
    dataEnergy = [],
    dataPowerEnergy = [],
    dataTemperature = [],
    dataAll = []
  const powerFuelTechs = {},
    energyFuelTechs = {},
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
      case DT.TEMPERATURE_MIN:
      case DT.TEMPERATURE_MAX:
        break
      case DT.TEMPERATURE:
      case DT.TEMPERATURE_MEAN:
        dataTemperature.push(d)
        break
      default:
        console.warn(`Parsing json error: unknown data type found - ${d.type}`)
    }
  })

  checkPowerEnergyExists({ dataPower, dataEnergy })

  // set up into its right order
  FT.DEFAULT_FUEL_TECH_ORDER.forEach(ft => {
    const dataPowerFT = dataPower.find(d => d.fuel_tech === ft)
    const dataEnergyFT = dataEnergy.find(d => d.fuel_tech === ft)
    if (dataPowerFT) {
      powerFuelTechs[ft] = dataPowerFT.id
    }
    if (dataEnergyFT) {
      energyFuelTechs[ft] = dataEnergyFT.id
    }
  })

  // setup energy dataset
  const isPowerData = dataPower.length > 0
  const fuelTechIdTypes =
    dataPower.length > 0 ? powerFuelTechs : energyFuelTechs
  const { start, num, intervalKey, intervalValue } = getStartEndNumInterval(
    dataPowerEnergy[0]
  )
  const dataset = [],
    temperatureDataset = []
  let currentDate = start
  for (let i = 1; i <= num; i++) {
    dataset.push({
      date: currentDate,
      time: currentDate.getTime()
    })
    temperatureDataset.push({
      date: currentDate,
      time: currentDate.getTime()
    })
    currentDate = incrementTime({
      date: currentDate,
      intervalKey,
      intervalValue
    })
  }

  dataAll.forEach(d => {
    const historyData = d.history.data

    /*
      for power data, there are 30 min interval data to interpolate
    */
    if (
      isPowerData &&
      (d.fuel_tech === FT.ROOFTOP_SOLAR ||
        d.fuel_tech === FT.SOLAR_ROOFTOP ||
        DT.isTemperature(d.type) ||
        DT.isPrice(d.type))
    ) {
      // 30m interval
      let index = 0
      if (d.forecast) {
        // add solar forecast data
        historyData.push.apply(historyData, d.forecast.data)
      }

      dataset.forEach((h, i) => {
        h[d.id] =
          typeof historyData[index] === 'undefined' ? null : historyData[index]
        if (i !== 0) {
          if (i % 6 === 0) {
            index += 1
          }
        }
      })
    } else {
      dataset.forEach((h, i) => {
        h[d.id] = historyData[i] || null
      })
    }
  })

  dataTemperature.forEach(d => {
    const historyData = d.history.data
    // 30m interval
    let index = 0
    temperatureDataset.forEach((h, i) => {
      h[d.id] =
        typeof historyData[index] === 'undefined' ? null : historyData[index]
      if (i !== 0) {
        if (i % 6 === 0) {
          index += 1
        }
      }
    })

    temperatureIds.push(d.id)
  })

  // console.log(dataset.length, num, fuelTechIdTypes)
  // console.log(dataset, temperatureDataset)

  return {
    dataset,
    fuelTechDataType: isPowerData ? DT.POWER : DT.ENERGY,
    temperatureDataset,
    fuelTechIdTypes,
    temperatureIds
  }
}

export function rollUp({ domains, dataset, interval }) {
  switch (interval) {
    case '30m':
      return rollUp30m(domains, dataset)
    default:
      return dataset
  }
}
