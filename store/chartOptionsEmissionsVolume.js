import * as OPTIONS from '@/constants/v2/chart-options.js'

export const state = () => ({
  chartType: OPTIONS.CHART_STACKED,
  chartYAxis: OPTIONS.CHART_YAXIS_ABSOLUTE,
  chartCurve: OPTIONS.CHART_CURVE_STEP
})

export const getters = {
  chartShown: state => state.chartType !== OPTIONS.CHART_HIDDEN,
  chartType: state => state.chartType,
  chartYAxis: state => state.chartYAxis,
  chartCurve: state => state.chartCurve
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
  }
}

export const actions = {}
