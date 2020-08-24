import * as OPTIONS from '@/constants/v2/chart-options.js'

export const state = () => ({
  chartType: OPTIONS.CHART_STACKED,
  chartYAxis: OPTIONS.CHART_YAXIS_ABSOLUTE,
  chartEnergyCurve: OPTIONS.CHART_CURVE_STEP,
  chartPowerCurve: OPTIONS.CHART_CURVE_SMOOTH,
  chartEnergyRenewablesLine: false
})

export const getters = {
  chartShown: state => state.chartType !== OPTIONS.CHART_HIDDEN,
  chartType: state => state.chartType,
  chartYAxis: state => state.chartYAxis,
  chartEnergyCurve: state => state.chartEnergyCurve,
  chartPowerCurve: state => state.chartPowerCurve,
  chartEnergyRenewablesLine: state => state.chartEnergyRenewablesLine
}

export const mutations = {
  chartType(state, data) {
    state.chartType = data
  },
  chartYAxis(state, data) {
    state.chartYAxis = data
  },
  chartEnergyCurve(state, data) {
    state.chartEnergyCurve = data
  },
  chartPowerCurve(state, data) {
    state.chartPowerCurve = data
  },
  chartEnergyRenewablesLine(state, data) {
    state.chartEnergyRenewablesLine = data
  }
}

export const actions = {}
