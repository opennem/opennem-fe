import _includes from 'lodash/includes'
import { isBefore } from 'date-fns';
import * as FT from '@/constants/energy-fuel-techs/group-detailed.js'

// Ceiling for a believable emission intensity, in kg CO2e/MWh. Brown coal, the dirtiest
// thing on the grid, runs about 1,200-1,400. Anything above this is a divide-by-almost-
// zero artefact rather than a measurement, and is shown as a gap.
const MAX_EMISSION_INTENSITY_KG_PER_MWH = 1500

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
  isWemOrAu,
  regionId,
  interval
}) {

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
    return 0
  }

  const getPowerEnergy = (data, domain) => {
    if (isEnergyType) {
      return data[domain.id] || 0
    } else {
      if (data[`${domain.id}_to_energy`]) {
        return data[`${domain.id}_to_energy`] || 0
      }
      return data[domain.id] || 0
    }
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

      if (domain.category !== 'load') {
        totalEmissionsMinusLoads += getEmissions(d, domain)
      }
    })

    powerEnergyDomains.forEach((domain) => {      
      totalPowerEnergy += getPowerEnergy(d, domain)
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
    }

    // A bucket where the visible sources contribute almost nothing gives a tiny
    // denominator and a huge but *finite* ratio, which Number.isFinite accepts, so the
    // chart drew a spike instead of a gap. Hiding every source but one is enough to
    // trigger it: the denominator is the visible set, not the whole network.
    //
    // The range check has to happen in one unit. `ei` is t/MWh on energy views and
    // kg/MWh on power views, so the old `ei > 1500` could only ever fire on power
    // views, which is why the monthly energy chart spiked unchecked. It also only
    // logged, and kept the value regardless.
    const intensity = Math.abs(ei)
    const intensityKgPerMWh = isEnergyType ? intensity * 1000 : intensity
    const isValidEI = Number.isFinite(ei) && intensityKgPerMWh <= MAX_EMISSION_INTENSITY_KG_PER_MWH

    obj._emissionIntensity = isValidEI ? intensity : null
    return obj
  })

  // nulled out EI data before jan 2009 and only for nem regions (exclude nem, au and wem)
  if (regionId !== 'nem' && regionId !== 'au' && regionId !== 'wem') {
    dataset.forEach(d => {
      if (isBefore(d.date, new Date(2009, 0, 1))) {
        d._emissionIntensity = null
      }
    })
  }

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