import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si'

export const state = () => ({
  chartDefaultType: OPTIONS.CHART_STACKED,
  chartType: OPTIONS.CHART_STACKED,
  chartYAxis: OPTIONS.CHART_YAXIS_EMISSIONS_VOL,
  chartCurve: OPTIONS.CHART_CURVE_STEP,

  chartUnit: 'tCO₂e',
  chartUnitPrefix: SI.MEGA,
  chartDisplayPrefix: SI.MEGA,

  chartDateAxis: true
})

export const getters = {
  chartShown: (state) => state.chartType !== OPTIONS.CHART_HIDDEN,
  chartDefaultType: (state) => state.chartDefaultType,
  chartType: (state) => state.chartType,
  chartYAxis: (state) => state.chartYAxis,
  chartCurve: (state) => state.chartCurve,

  chartUnit: (state) => state.chartUnit,
  chartUnitPrefix: (state) => state.chartUnitPrefix,
  chartDisplayPrefix: (state) => state.chartDisplayPrefix,
  chartCurrentUnit: (state) => `${state.chartDisplayPrefix}${state.chartUnit}`,

  chartDateAxis: (state) => state.chartDateAxis
}

export const mutations = {
  chartType(state, data) {
    state.chartType = data
  },
  chartYAxis(state, data) {
    state.chartYAxis = data
  },
  chartCurve(state, data) {
    state.chartCurve = data
  },
  chartUnit(state, data) {
    state.chartUnit = data
  },
  chartUnitPrefix(state, data) {
    state.chartUnitPrefix = data
  },
  chartDisplayPrefix(state, data) {
    state.chartDisplayPrefix = data
  },
  chartDateAxis(state, data) {
    state.chartDateAxis = data
  }
}

export const actions = {
  doShowChart({ commit }) {
    commit('chartType', OPTIONS.CHART_STACKED)
  },
  doHideChart({ commit }) {
    commit('chartType', OPTIONS.CHART_HIDDEN)
  },
  reset({ commit }) {
    commit('chartType', OPTIONS.CHART_STACKED)
    commit('chartYAxis', OPTIONS.CHART_YAXIS_EMISSIONS_VOL)
    commit('chartCurve', OPTIONS.CHART_CURVE_SMOOTH)
    commit('chartUnitPrefix', SI.MEGA)
    commit('chartDisplayPrefix', SI.MEGA)
  },
  setStepCurve({ commit }) {
    commit('chartCurve', OPTIONS.CHART_CURVE_STEP)
  }
}
