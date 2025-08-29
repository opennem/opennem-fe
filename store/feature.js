import { lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_CURTAILMENT_SERIES,
  SHOW_BANNER
} from '@/constants/mutation-types/features.js'

export const state = () => ({
  curtailmentSeries: false,
  showBanner: true
})

export const getters = {
  curtailmentSeries: (state) => state.curtailmentSeries,
  showBanner: (state) => state.showBanner
}

export const mutations = {
  curtailmentSeries(state, curtailmentSeries) {
    lsSet(FEATURE_TOGGLE_CURTAILMENT_SERIES, curtailmentSeries)
    state.curtailmentSeries = curtailmentSeries
  },
  showBanner(state, showBanner) {
    lsSet(SHOW_BANNER, showBanner)
    state.showBanner = showBanner
  },
}

export const actions = {}
