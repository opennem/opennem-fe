export const state = () => ({
  chartType: 'area', // line, proportion, area, hidden
  chartYAxis: 'absolute', // absolute, percentage
  chartEnergyCurve: 'step', // smooth, step, linear
  chartPowerCurve: 'smooth', // smooth, step, linear
  chartEnergyRenewablesLine: false
})

export const getters = {
  chartShown: state => state.chartType !== 'hidden',
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
