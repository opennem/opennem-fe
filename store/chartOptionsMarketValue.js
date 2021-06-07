import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si'

export const state = () => ({
  chartDefaultType: OPTIONS.CHART_STACKED,
  chartType: OPTIONS.CHART_STACKED,
  chartYAxis: OPTIONS.CHART_YAXIS_ABSOLUTE,
  chartCurve: OPTIONS.CHART_CURVE_STEP,

  chartUnitPrefix: SI.BASE,
  chartDisplayPrefix: SI.THOUSAND
})

export const getters = {
  chartShown: state => state.chartType !== OPTIONS.CHART_HIDDEN,
  chartDefaultType: state => state.chartDefaultType,
  chartType: state => state.chartType,
  chartYAxis: state => state.chartYAxis,
  chartCurve: state => state.chartCurve,

  chartUnitPrefix: state => state.chartUnitPrefix,
  chartDisplayPrefix: state => state.chartDisplayPrefix,
  chartCurrentUnit: state => state.chartDisplayPrefix
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

  chartUnitPrefix(state, data) {
    state.chartUnitPrefix = data
  },
  chartDisplayPrefix(state, data) {
    state.chartDisplayPrefix = data
  }
}

export const actions = {}
