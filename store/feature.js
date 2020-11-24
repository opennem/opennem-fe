import { lsSet } from '~/services/LocalStorage'
import {
  FEATURE_TOGGLE_EMISSIONS,
  FEATURE_TOGGLE_REGION_COMPARE,
  FEATURE_TOGGLE_V3_PATHS,
  FEATURE_TOGGLE_METRICS
} from '@/constants/mutation-types/features.js'

export const state = () => ({
  emissions: false,
  regionCompare: false,
  v3Paths: false,
  metrics: false
})

export const getters = {
  emissions: state => state.emissions,
  regionCompare: state => state.regionCompare,
  v3Paths: state => state.v3Paths,
  metrics: state => state.metrics
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
  v3Paths(state, v3Paths) {
    lsSet(FEATURE_TOGGLE_V3_PATHS, v3Paths)
    state.v3Paths = v3Paths
  },
  metrics(state, metrics) {
    lsSet(FEATURE_TOGGLE_METRICS, metrics)
    state.metrics = metrics
  }
}

export const actions = {}
