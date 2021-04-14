import { lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_EMISSIONS,
  FEATURE_TOGGLE_REGION_COMPARE,
  FEATURE_TOGGLE_AU_ENERGY,
  FEATURE_TOGGLE_V3_DATA
} from '@/constants/mutation-types/features.js'

export const state = () => ({
  emissions: false,
  regionCompare: false,
  auEnergy: false,
  v3Data: false
})

export const getters = {
  emissions: state => state.emissions,
  regionCompare: state => state.regionCompare,
  auEnergy: state => state.auEnergy,
  v3Data: state => state.v3Data
}

export const mutations = {
  emissions(state, emissions) {
    lsSet(FEATURE_TOGGLE_EMISSIONS, emissions)
    state.emissions = emissions
  },
  regionCompare(state, regionCompare) {
    lsSet(FEATURE_TOGGLE_REGION_COMPARE, regionCompare)
    state.regionCompare = regionCompare
  },
  auEnergy(state, auEnergy) {
    lsSet(FEATURE_TOGGLE_AU_ENERGY, auEnergy)
    state.auEnergy = auEnergy
  },
  v3Data(state, v3Data) {
    lsSet(FEATURE_TOGGLE_V3_DATA, v3Data)
    state.v3Data = v3Data
  }
}

export const actions = {}
