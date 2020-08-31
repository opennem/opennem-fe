import * as OPTIONS from '@/constants/v2/chart-options.js'

export const state = () => ({
  chartDefaultType: OPTIONS.CHART_LINE,
  chartType: OPTIONS.CHART_LINE,
  chartYAxis: OPTIONS.CHART_YAXIS_ABSOLUTE,
  chartCurve: OPTIONS.CHART_CURVE_SMOOTH
})

export const getters = {
  chartShown: state => state.chartType !== OPTIONS.CHART_HIDDEN,
  chartDefaultType: state => state.chartDefaultType,
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
