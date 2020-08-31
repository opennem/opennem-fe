import * as OPTIONS from '@/constants/v2/chart-options.js'

export const state = () => ({
  chartDefaultType: OPTIONS.CHART_STACKED,
  chartType: OPTIONS.CHART_STACKED,
  chartEnergyYAxis: OPTIONS.CHART_YAXIS_ENERGY,
  chartPowerYAxis: OPTIONS.CHART_YAXIS_ABSOLUTE,
  chartEnergyCurve: OPTIONS.CHART_CURVE_STEP,
  chartPowerCurve: OPTIONS.CHART_CURVE_SMOOTH,
  chartEnergyRenewablesLine: false
})

export const getters = {
  chartShown: state => state.chartType !== OPTIONS.CHART_HIDDEN,
  chartDefaultType: state => state.chartDefaultType,
  chartType: state => state.chartType,
  chartEnergyYAxis: state => state.chartEnergyYAxis,
  chartPowerYAxis: state => state.chartPowerYAxis,
  chartEnergyCurve: state => state.chartEnergyCurve,
  chartPowerCurve: state => state.chartPowerCurve,
  chartEnergyRenewablesLine: state => state.chartEnergyRenewablesLine
}

export const mutations = {
  chartType(state, data) {
    state.chartType = data
  },
  chartEnergyYAxis(state, data) {
    state.chartEnergyYAxis = data
  },
  chartPowerYAxis(state, data) {
    state.chartPowerYAxis = data
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
