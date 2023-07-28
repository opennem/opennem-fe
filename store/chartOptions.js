import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si'

export const state = () => ({
  chartDefaultType: OPTIONS.CHART_LINE,
  chartType: OPTIONS.CHART_LINE,
  chartYAxis: OPTIONS.CHART_YAXIS_ABSOLUTE,
  chartCurve: OPTIONS.CHART_CURVE_SMOOTH,

  chartUnit: '',
  chartUnitPrefix: SI.BASE,
  chartDisplayPrefix: SI.BASE,

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
    commit('chartType', OPTIONS.CHART_LINE)
  },
  doHideChart({ commit }) {
    commit('chartType', OPTIONS.CHART_HIDDEN)
  },
  reset({ commit }) {
    commit('chartType', OPTIONS.CHART_LINE)
    commit('chartYAxis', OPTIONS.CHART_YAXIS_ABSOLUTE)
    commit('chartCurve', OPTIONS.CHART_CURVE_SMOOTH)
    commit('chartUnitPrefix', SI.BASE)
    commit('chartDisplayPrefix', SI.BASE)
  },
  setStepCurve({ commit }) {
    commit('chartCurve', OPTIONS.CHART_CURVE_SMOOTH)
  }
}
