import { lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_EMISSIONS,
  FEATURE_TOGGLE_COMPARE_PRICE
} from '@/constants/mutation-types/features.js'

export const state = () => ({
  emissions: false,
  comparePrice: false
})

export const getters = {
  emissions: (state) => state.emissions,
  comparePrice: (state) => state.comparePrice
}

export const mutations = {
  emissions(state, emissions) {
    lsSet(FEATURE_TOGGLE_EMISSIONS, emissions)
    state.emissions = emissions
  },
  comparePrice(state, comparePrice) {
    lsSet(FEATURE_TOGGLE_COMPARE_PRICE, comparePrice)
    state.comparePrice = comparePrice
  }
}

export const actions = {}
