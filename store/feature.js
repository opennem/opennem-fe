import { lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_EMISSIONS,
  FEATURE_TOGGLE_REGION_COMPARE,
  FEATURE_TOGGLE_COMPARE_PRICE
} from '@/constants/mutation-types/features.js'

export const state = () => ({
  emissions: false,
  regionCompare: false,
  comparePrice: false
})

export const getters = {
  emissions: (state) => state.emissions,
  regionCompare: (state) => state.regionCompare,
  comparePrice: (state) => state.comparePrice
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
  comparePrice(state, comparePrice) {
    lsSet(FEATURE_TOGGLE_COMPARE_PRICE, comparePrice)
    state.comparePrice = comparePrice
  }
}

export const actions = {}
