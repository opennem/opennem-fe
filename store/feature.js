import { lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_COMPARE_PRICE,
  SHOW_BANNER
} from '@/constants/mutation-types/features.js'

export const state = () => ({
  comparePrice: false,
  showBanner: true
})

export const getters = {
  comparePrice: (state) => state.comparePrice,
  showBanner: (state) => state.showBanner
}

export const mutations = {
  comparePrice(state, comparePrice) {
    lsSet(FEATURE_TOGGLE_COMPARE_PRICE, comparePrice)
    state.comparePrice = comparePrice
  },
  showBanner(state, showBanner) {
    lsSet(SHOW_BANNER, showBanner)
    state.showBanner = showBanner
  }
}

export const actions = {}
