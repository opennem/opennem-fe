import { lsSet } from '~/services/LocalStorage'
import {
  SHOW_BANNER
} from '@/constants/mutation-types/features.js'

export const state = () => ({
  showBanner: true
})

export const getters = {
  showBanner: (state) => state.showBanner
}

export const mutations = {
  showBanner(state, showBanner) {
    lsSet(SHOW_BANNER, showBanner)
    state.showBanner = showBanner
  },
}

export const actions = {}
