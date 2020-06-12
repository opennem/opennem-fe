export const state = () => ({
  isHovering: false,
  chartEnergy: true,
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
