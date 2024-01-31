import _includes from 'lodash/includes'
import * as FT from '@/constants/energy-fuel-techs/group-detailed.js'

function calAverage(isEnergyType, isWemOrAu, dataset) {
  const totalEmissions = dataset.reduce(
    (prev, cur) => prev + cur._totalEmissions,
    0
  )
  const totalPowerEnergy = dataset.reduce(
    (prev, cur) => prev + cur._totalPowerEnergy,
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

  // console.log('calculate EI', emissionsDomains, powerEnergyDomains, domainPowerEnergy)

  const timeCheck = 1696140000000
  const shouldTimeCheck = false

  /**
    when viewing generation:
    sum(all emissions from visible sources except imports) / energy from all of the above

    when viewing consumption:
    sum(all emissions from visible sources) minus exports / energy from all of the above
 */
  const getEmissions = (data, domain) => {
    if (isCalculateByGeneration) {
      /** Generation */
      // return value if category is source and not imports
      if (domain.category === 'source' && !_includes(domain.id, 'imports')) {
        return data[domain.id] || 0
      }
    } else {
      /** Consumption */
      // return exports as negative value
      if (_includes(domain.id, 'exports')) {
        return -data[domain.id] || 0
      }

      // return value if category is source
      if (domain.category === 'source') {
        return data[domain.id] || 0
      }
    }

    // else return 0
    return 0
  }

  const getPowerEnergy = (data, domain) => {
    // return value if category is source or exports
    // if (domain.category === 'source' || _includes(domain.id, 'exports')) {
    //   return data[domain.id] || 0
    // }
    return data[domain.id] || 0
  }

  const getPowerEnergy2 = (data, domain) => {
    // test only
    return data[domain.id] || 0
  }
  
  const batteryDischarging = domainPowerEnergy.find(
    (d) => d.fuelTech === FT.BATTERY_DISCHARGING
  )

  let hasSource = false

  powerEnergyDomains.forEach((domain) => {
    if (domain.category === 'source') {
      hasSource = true
    }
  })

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
      totalEmissions += getEmissions(d, domain)

      if (shouldTimeCheck && d.time === timeCheck) {
        console.log(`emissions,${domain.id},${getEmissions(d, domain)}`)
      }

      if (domain.category !== 'load') {
        totalEmissionsMinusLoads += getEmissions(d, domain)
      }
    })

    powerEnergyDomains.forEach((domain) => {
      totalPowerEnergy += getPowerEnergy(d, domain)

      if (shouldTimeCheck && d.time === timeCheck) {
        console.log(`power,${domain.id},${getPowerEnergy2(d, domain)}`)
      }
    })

    if (shouldTimeCheck && d.time === timeCheck) {
      console.log('totalEmissions', totalEmissions)
      console.log('totalPowerEnergy', totalPowerEnergy)
    }

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

    if (shouldTimeCheck && d.time === timeCheck) {
      console.log('EI', ei)
    }

    const isValidEI = Number.isFinite(ei)

    if (ei < 0 || ei > 1500) {
      console.error(`EI out of range: ${ei}`)
    }

    obj._emissionIntensity = isValidEI ? Math.abs(ei) : null
    return obj
  })

  const sumEmissionsMinusLoads = dataset.reduce(
    (prev, cur) => prev + cur._totalEmissionsMinusLoads,
    0
  )
  const sumEmissions = dataset.reduce(
    (prev, cur) => prev + cur._totalEmissions,
    0
  )
  const averageEmissions = hasSource 
    ? sumEmissionsMinusLoads / dataset.length 
    : Math.abs(sumEmissions / dataset.length)
  
  if (averageEmissions < 0) {
    // console.log(`averageEmissions < 0: ${averageEmissions}`)
  } else {
    // console.log(`emissions intensity... ${averageEmissions}`, hasSource, sumEmissionsMinusLoads, dataset.length, powerEnergyDomains, emissionsDomains)
  }

  return {
    emissionIntensityData: dataset,
    averageEmissionIntensity: calAverage(isEnergyType, isWemOrAu, dataset),
    averageEmissions,
    sumEmissionsMinusLoads
  }
}