import _cloneDeep from 'lodash.clonedeep'
export const state = () => ({
  isHovering: false,
  hoverDate: null,
  hoverDomain: null,
  isFocusing: false,
  focusDate: null,
  dateZoomExtent: [],
  chartEnergyType: 'area', // line, proportion, area, hidden
  chartEnergyYAxis: 'absolute', // absolute, percentage
  chartEnergyCurve: 'step', // smooth, step, linear
  chartPowerCurve: 'smooth', // smooth, step, linear
  chartEnergyRenewablesLine: false,
  chartEmissionsVolume: true,
  chartEmissionsIntensity: true,
  chartPrice: true,
  chartTemperature: true,
  chartSummaryPie: true
})

export const getters = {
  isHovering: state => state.isHovering,
  hoverDate: state => state.hoverDate,
  hoverDomain: state => state.hoverDomain,
  isFocusing: state => state.isFocusing,
  focusDate: state => state.focusDate,
  dateZoomExtent: state => _cloneDeep(state.dateZoomExtent),
  chartEnergy: state => state.chartEnergyType !== 'hidden',
  chartEnergyType: state => state.chartEnergyType,
  chartEnergyYAxis: state => state.chartEnergyYAxis,
  chartEnergyCurve: state => state.chartEnergyCurve,
  chartPowerCurve: state => state.chartPowerCurve,
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
  hoverDate(state, hoverDate) {
    state.hoverDate = hoverDate
  },
  hoverDomain(state, hoverDomain) {
    state.hoverDomain = hoverDomain
  },
  isFocusing(state, isFocusing) {
    state.isFocusing = isFocusing
  },
  focusDate(state, focusDate) {
    state.focusDate = focusDate
  },
  dateZoomExtent(state, dateZoomExtent) {
    state.dateZoomExtent = _cloneDeep(dateZoomExtent)
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
  chartPowerCurve(state, data) {
    state.chartPowerCurve = data
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
