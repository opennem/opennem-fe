import * as FT from '@/constants/energy-fuel-techs/group-default.js'
import { is } from 'date-fns/locale'

function calAverage(isEnergyType, isWemOrAu, dataset) {
  const totalEmissions = dataset.reduce(
    (prev, cur) => prev + cur._totalEmissions,
    0
  )
  const totalPowerEnergy = dataset.reduce(
    (prev, cur) => prev + cur._totalPowerEnergyMinusBatteryDischarging,
    0
  )

  let ei = totalEmissions / totalPowerEnergy

  if (!isEnergyType) {
    ei = ei * 1000

    if (isWemOrAu) {
      ei = ei * 2
    } else {
      ei = ei * 12
    }
  }

  return ei
}

export default function({
  datasetAll,
  isCalculateByGeneration,
  emissionsDomains,
  powerEnergyDomains,
  domainPowerEnergy,
  isEnergyType,
  isWemOrAu
}) {
  const addUp = (data, domain) => {
    // if (isCalculateByGeneration) {
    //   // only if it's a source AND it's not imports
    //   if (domain.category === 'source' && domain.fuelTech !== 'imports') {
    //     return data[domain.id] || 0
    //   }
    // } else {
    //   // it's not a load OR it's exports
    //   if (domain.category !== 'load' || domain.fuelTech === 'exports') {
    //     return Math.abs(data[domain.id]) || 0
    //   }
    // }

    // only if it's a source AND it's not imports
    if (domain.category === 'source' && domain.fuelTech !== 'imports') {
      return data[domain.id] || 0
    }
    return 0
  }
  
  const batteryDischarging = domainPowerEnergy.find(
    (d) => d.fuelTech === FT.BATTERY_DISCHARGING
  )

  const dataset = datasetAll.map((d) => {
    const obj = {
      date: d.date,
      time: d.time,
      _isIncompleteBucket: d._isIncompleteBucket
    }
    let totalEmissions = 0,
      totalEmissionsMinusLoads = 0,
      totalPowerEnergy = 0,
      totalBatteryDischarging = 0

    if (batteryDischarging && d[batteryDischarging.id]) {
      totalBatteryDischarging += d[batteryDischarging.id]
    }

    emissionsDomains.forEach((domain) => {
      totalEmissions += addUp(d, domain)

      if (domain.category !== 'load') {
        totalEmissionsMinusLoads += addUp(d, domain)
      }
    })

    powerEnergyDomains.forEach((domain) => {
      totalPowerEnergy += addUp(d, domain)
    })

    const totalPowerEnergyMinusBatteryDischarging =
      totalPowerEnergy - totalBatteryDischarging
    
    obj._totalEmissions = totalEmissions
    obj._totalEmissionsMinusLoads = totalEmissionsMinusLoads
    obj._totalPowerEnergyMinusBatteryDischarging =
      totalPowerEnergyMinusBatteryDischarging
    obj._totalPowerEnergy = totalPowerEnergy

    let ei = totalEmissions / totalPowerEnergy
    
    if (!isEnergyType) {
      ei = ei * 1000

      if (isWemOrAu) {
        ei = ei * 2
      } else {
        ei = ei * 12
      }
    }
    
    const isValidEI = Number.isFinite(ei)

    if ((ei < 0 || ei > 1500) || !isValidEI) {
      console.error(`EI out of range: ${ei}`)
    }

    obj._emissionIntensity = isValidEI ? Math.abs(ei) : null
    return obj
  })

  const sumEmissionsMinusLoads = dataset.reduce(
    (prev, cur) => prev + cur._totalEmissionsMinusLoads,
    0
  )

  return {
    emissionIntensityData: dataset,
    averageEmissionIntensity: calAverage(isEnergyType, isWemOrAu, dataset),
    averageEmissions: sumEmissionsMinusLoads / dataset.length,
    sumEmissionsMinusLoads
  }
}