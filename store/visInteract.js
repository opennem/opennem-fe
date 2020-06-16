export const state = () => ({
  isHovering: false,
  chartEnergy: true,
  chartEnergyType: 'area', // line, proportion, area
  chartEnergyYAxis: 'absolute', // absolute, percentage
  chartEnergyCurve: 'smooth', // smooth, step
  chartEnergyRenewablesLine: false,
  chartEmissionsVolume: true,
  chartEmissionsIntensity: true,
  chartPrice: true,
  chartTemperature: true,
  chartSummaryPie: true
})

export const getters = {
  isHovering: state => state.isHovering,
  chartEnergy: state => state.chartEnergy,
  chartEnergyType: state => state.chartEnergyType,
  chartEnergyYAxis: state => state.chartEnergyYAxis,
  chartEnergyCurve: state => state.chartEnergyCurve,
  chartEnergyRenewablesLine: state => state.chartEnergyRenewablesLine,
  chartEmissionsVolume: state => state.chartEmissionsVolume,
  chartEmissionsIntensity: state => state.chartEmissionsIntensity,
  chartPrice: state => state.chartPrice,
  chartTemperature: state => state.chartTemperature,
  chartSummaryPie: state => state.chartSummaryPie
}

export const mutations = {
  isHovering(state, isHovering) {
    state.isHovering = isHovering
  },
  chartEnergy(state, data) {
    state.chartEnergy = data
  },
  chartEnergyType(state, data) {
    state.chartEnergyType = data
  },
  chartEnergyYAxis(state, data) {
    state.chartEnergyYAxis = data
  },
  chartEnergyCurve(state, data) {
    state.chartEnergyCurve = data
  },
  chartEnergyRenewablesLine(state, data) {
    state.chartEnergyRenewablesLine = data
  },
  chartEmissionsVolume(state, data) {
    state.chartEmissionsVolume = data
  },
  chartEmissionsIntensity(state, data) {
    state.chartEmissionsIntensity = data
  },
  chartPrice(state, data) {
    state.chartPrice = data
  },
  chartTemperature(state, data) {
    state.chartTemperature = data
  },
  chartSummaryPie(state, data) {
    state.chartSummaryPie = data
  }
}

export const actions = {}
