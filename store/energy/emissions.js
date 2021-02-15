import _cloneDeep from 'lodash.clonedeep'
import * as FT from '@/constants/energy-fuel-techs/group-default.js'

export const state = () => ({
  emissionIntensityData: [],
  averageEmissionIntensity: null,
  averageEmissions: null,
  sumEmissionsMinusLoads: null
})

export const mutations = {
  emissionIntensityData(state, emissionIntensityData) {
    state.emissionIntensityData = _cloneDeep(emissionIntensityData)
  },
  averageEmissionIntensity(state, averageEmissionIntensity) {
    state.averageEmissionIntensity = averageEmissionIntensity
  },
  averageEmissions(state, averageEmissions) {
    state.averageEmissions = averageEmissions
  },
  sumEmissionsMinusLoads(state, sumEmissionsMinusLoads) {
    state.sumEmissionsMinusLoads = sumEmissionsMinusLoads
  }
}

export const getters = {
  emissionIntensityData: state => state.emissionIntensityData,
  averageEmissionIntensity: state => state.averageEmissionIntensity,
  averageEmissions: state => state.averageEmissions,
  sumEmissionsMinusLoads: state => state.sumEmissionsMinusLoads
}

export const actions = {
  doUpdateEmissionIntensityDataset(
    { commit },
    {
      datasetAll,
      isCalculateByGeneration,
      emissionsDomains,
      powerEnergyDomains,
      domainPowerEnergy
    }
  ) {
    const addUp = (data, domain) => {
      if (isCalculateByGeneration) {
        // only if it's a source AND it's not imports
        if (domain.category === 'source' && domain.fuelTech !== 'imports') {
          return data[domain.id] || 0
        }
      } else {
        // it's not a load OR it's exports
        if (domain.category !== 'load' || domain.fuelTech === 'exports') {
          return data[domain.id] || 0
        }
      }
      return 0
    }
    const batteryDischarging = domainPowerEnergy.find(
      d => d.fuelTech === FT.BATTERY_DISCHARGING
    )

    const dataset = datasetAll.map(d => {
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

      emissionsDomains.forEach(domain => {
        totalEmissions += addUp(d, domain)

        if (domain.category !== 'load') {
          totalEmissionsMinusLoads += addUp(d, domain)
        }
      })

      powerEnergyDomains.forEach(domain => {
        totalPowerEnergy += addUp(d, domain)
      })

      const totalPowerEnergyMinusBatteryDischarging =
        totalPowerEnergy - totalBatteryDischarging

      obj._totalEmissions = totalEmissions
      obj._totalEmissionsMinusLoads = totalEmissionsMinusLoads
      obj._totalPowerEnergyMinusBatteryDischarging = totalPowerEnergyMinusBatteryDischarging

      let ei = totalEmissions / totalPowerEnergyMinusBatteryDischarging
      const isValidEI = Number.isFinite(ei)

      obj._emissionIntensity = isValidEI ? ei : null
      return obj
    })

    const sumEmissionsMinusLoads = dataset.reduce(
      (prev, cur) => prev + cur._totalEmissionsMinusLoads,
      0
    )

    commit('emissionIntensityData', dataset)
    commit('averageEmissionIntensity', calAverage(dataset))
    commit('averageEmissions', sumEmissionsMinusLoads / dataset.length)
    commit('sumEmissionsMinusLoads', sumEmissionsMinusLoads)
  }
}

function calAverage(dataset) {
  const totalEmissions = dataset.reduce(
    (prev, cur) => prev + cur._totalEmissions,
    0
  )
  const totalPowerEnergy = dataset.reduce(
    (prev, cur) => prev + cur._totalPowerEnergyMinusBatteryDischarging,
    0
  )

  return totalEmissions / totalPowerEnergy
}
