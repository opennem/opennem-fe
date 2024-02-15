import { lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_COMPARE_PRICE
} from '@/constants/mutation-types/features.js'

export const state = () => ({
  comparePrice: false
})

export const getters = {
  comparePrice: (state) => state.comparePrice
}

export const mutations = {
  comparePrice(state, comparePrice) {
    lsSet(FEATURE_TOGGLE_COMPARE_PRICE, comparePrice)
    state.comparePrice = comparePrice
  }
}

export const actions = {}
