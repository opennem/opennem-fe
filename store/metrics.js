import { periods, metrics } from '@/constants/metrics/'

export const state = () => ({
  selectedPeriod: periods[1].value,
  selectedMetric: metrics[1].value
})

export const getters = {
  selectedPeriod: state => state.selectedPeriod,
  selectedMetric: state => state.selectedMetric
}

export const mutations = {
  selectedPeriod(state, selectedPeriod) {
    state.selectedPeriod = selectedPeriod
  },
  selectedMetric(state, selectedMetric) {
    state.selectedMetric = selectedMetric
  }
}

export const actions = {}
