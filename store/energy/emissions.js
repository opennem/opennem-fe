import _cloneDeep from 'lodash.clonedeep'
import calculateCarbonIntensity from '@/data/calculate-carbon-intensity'

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
  emissionIntensityData: (state) => state.emissionIntensityData,
  averageEmissionIntensity: (state) => state.averageEmissionIntensity,
  averageEmissions: (state) => state.averageEmissions,
  sumEmissionsMinusLoads: (state) => state.sumEmissionsMinusLoads
}

export const actions = {
  doUpdateEmissionIntensityDataset(
    { commit },
    {
      datasetAll,
      isCalculateByGeneration,
      emissionsDomains,
      powerEnergyDomains,
      domainPowerEnergy,
      isEnergyType
    }
  ) {
    
    const { 
      emissionIntensityData,
      averageEmissionIntensity,
      averageEmissions,
      sumEmissionsMinusLoads
    } = calculateCarbonIntensity({
      datasetAll,
      isCalculateByGeneration,
      emissionsDomains,
      powerEnergyDomains,
      domainPowerEnergy,
      isEnergyType
    })

    commit('emissionIntensityData', emissionIntensityData)
    commit('averageEmissionIntensity', averageEmissionIntensity)
    commit('averageEmissions', averageEmissions)
    commit('sumEmissionsMinusLoads', sumEmissionsMinusLoads)
  }
}
