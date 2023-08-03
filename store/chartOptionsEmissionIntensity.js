import * as OPTIONS from '@/constants/chart-options.js'

export const state = () => ({
  chartDefaultType: OPTIONS.CHART_LINE,
  chartType: OPTIONS.CHART_LINE,
  chartYAxis: OPTIONS.CHART_YAXIS_ABSOLUTE,
  chartCurve: OPTIONS.CHART_CURVE_STEP,
  chartDateAxis: true
})

export const getters = {
  chartShown: (state) => state.chartType !== OPTIONS.CHART_HIDDEN,
  chartDefaultType: (state) => state.chartDefaultType,
  chartType: (state) => state.chartType,
  chartYAxis: (state) => state.chartYAxis,
  chartCurve: (state) => state.chartCurve,
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
  chartDateAxis(state, data) {
    state.chartDateAxis = data
  }
}

export const actions = {}
