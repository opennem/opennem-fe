import _isEmpty from 'lodash.isempty'
import { lsSet } from '@/services/LocalStorage'

const charts = [
  {
    name: 'exportPowerEnergy',
    label: 'Energy',
    commit: 'powerEnergy'
  },
  {
    name: 'exportEmissionsVolume',
    label: 'Emissions Volume',
    commit: 'emissionsVolume'
  },
  {
    name: 'exportEmissionIntensity',
    label: 'Emissions Intensity',
    commit: 'emissionIntensity'
  },
  {
    name: 'exportPrice',
    label: 'Price',
    commit: 'price'
  },
  {
    name: 'exportTemperature',
    label: 'Temperature',
    commit: 'temperature'
  }
]

export const state = () => ({
  title: '',
  description: '',

  charts,
  powerEnergy: false,
  emissionsVolume: false,
  emissionIntensity: false,
  price: false,
  temperature: false
})

export const mutations = {
  title(state, data) {
    state.title = data
  },
  description(state, data) {
    state.description = data
  },

  powerEnergy(state, data) {
    lsSet('exportPowerEnergy', data)
    state.powerEnergy = data
  },
  emissionsVolume(state, data) {
    lsSet('exportEmissionsVolume', data)
    state.emissionsVolume = data
  },
  emissionIntensity(state, data) {
    lsSet('exportEmissionIntensity', data)
    state.emissionIntensity = data
  },
  price(state, data) {
    lsSet('exportPrice', data)
    state.price = data
  },
  temperature(state, data) {
    lsSet('exportTemperature', data)
    state.temperature = data
  }
}

export const getters = {
  title: (state) => state.title,
  description: (state) => state.description,

  charts: (state) => state.charts,
  powerEnergy: (state) => state.powerEnergy,
  emissionsVolume: (state) => state.emissionsVolume,
  emissionIntensity: (state) => state.emissionIntensity,
  price: (state) => state.price,
  temperature: (state) => state.temperature,

  hasGenerationOrEmissionsVolumeSelected: (state) => {
    return state.powerEnergy || state.emissionsVolume
  }
}

export const actions = {
  title({ commit }, data) {
    commit('title', data)
  },
  description({ commit }, data) {
    commit('description', data)
  }
}
