import * as OPTIONS from '@/constants/chart-options.js'
import * as SI from '@/constants/si'

export const state = () => ({
  chartDefaultType: OPTIONS.CHART_STACKED,
  chartType: OPTIONS.CHART_STACKED,
  chartCurve: OPTIONS.CHART_CURVE_SMOOTH,

  chartEnergyYAxis: OPTIONS.CHART_YAXIS_ENERGY,
  chartEnergyUnit: 'Wh',
  chartEnergyUnitPrefix: SI.MEGA,
  chartEnergyDisplayPrefix: SI.MEGA,

  chartPowerUnit: 'W',
  chartPowerUnitPrefix: SI.MEGA,
  chartPowerDisplayPrefix: SI.MEGA
})

export const getters = {
  chartShown: state => state.chartType !== OPTIONS.CHART_HIDDEN,
  chartDefaultType: state => state.chartDefaultType,
  chartType: state => state.chartType,
  chartCurve: state => state.chartCurve,

  chartEnergyYAxis: state => state.chartEnergyYAxis,
  chartEnergyUnit: state => state.chartEnergyUnit,
  chartEnergyUnitPrefix: state => state.chartEnergyUnitPrefix,
  chartEnergyDisplayPrefix: state => state.chartEnergyDisplayPrefix,
  chartEnergyCurrentUnit: state =>
    `${state.chartEnergyDisplayPrefix}${state.chartEnergyUnit}`,

  chartPowerUnit: state => state.chartPowerUnit,
  chartPowerUnitPrefix: state => state.chartPowerUnitPrefix,
  chartPowerDisplayPrefix: state => state.chartPowerDisplayPrefix,
  chartPowerCurrentUnit: state =>
    `${state.chartPowerDisplayPrefix}${state.chartPowerUnit}`
}

export const mutations = {
  chartType(state, data) {
    state.chartType = data
  },
  chartCurve(state, data) {
    state.chartCurve = data
  },

  chartEnergyYAxis(state, data) {
    state.chartEnergyYAxis = data
  },
  chartEnergyUnit(state, data) {
    state.chartEnergyUnit = data
  },
  chartEnergyUnitPrefix(state, data) {
    state.chartEnergyUnitPrefix = data
  },
  chartEnergyDisplayPrefix(state, data) {
    state.chartEnergyDisplayPrefix = data
  },

  chartPowerUnit(state, data) {
    state.chartPowerUnit = data
  },
  chartPowerUnitPrefix(state, data) {
    state.chartPowerUnitPrefix = data
  },
  chartPowerDisplayPrefix(state, data) {
    state.chartPowerDisplayPrefix = data
  }
}

export const actions = {}
