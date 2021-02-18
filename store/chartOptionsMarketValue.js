import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si'

export const state = () => ({
  chartDefaultType: OPTIONS.CHART_STACKED,
  chartType: OPTIONS.CHART_STACKED,
  chartYAxis: OPTIONS.CHART_YAXIS_ABSOLUTE,
  chartCurve: OPTIONS.CHART_CURVE_STEP
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
