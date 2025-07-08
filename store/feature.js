import { lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_COMPARE_PRICE,
  FEATURE_TOGGLE_CAPACITY_CHARTS,
  SHOW_BANNER
} from '@/constants/mutation-types/features.js'

export const state = () => ({
  comparePrice: false,
  capacityCharts: false,
  showBanner: true
})

export const getters = {
  comparePrice: (state) => state.comparePrice,
  capacityCharts: (state) => state.capacityCharts,
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
  },
  capacityCharts(state, capacityCharts) {
    lsSet(FEATURE_TOGGLE_CAPACITY_CHARTS, capacityCharts)
    state.capacityCharts = capacityCharts
  }
}

export const actions = {}
