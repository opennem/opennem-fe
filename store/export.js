export const state = () => ({
  title: '',
  description: '',
  chartEnergy: true,
  chartEmissionsVolume: false,
  chartEmissionsIntensity: false,
  chartPrice: false,
  chartTemperature: false,
  summary: false,
  legend: true,
  stackedAreaDomains: [],
  stackedEnergyPercentDomains: [],
  dataset: [],
  summaryDomains: [],
  xGuides: [],
  emissionDomains: [],
  priceDomains: [],
  marketValueDomains: [],
  temperatureDomains: [],
  temperatureMeanId: '',
  temperatureMinId: '',
  temperatureMaxId: ''
})

export const mutations = {
  title(state, data) {
    state.title = data
  },
  description(state, data) {
    state.description = data
  },
  chartEnergy(state, data) {
    state.chartEnergy = data
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
  summary(state, data) {
    state.summary = data
  },
  legend(state, data) {
    state.legend = data
  },
  stackedAreaDomains(state, data) {
    state.stackedAreaDomains = data
  },
  stackedEnergyPercentDomains(state, data) {
    state.stackedEnergyPercentDomains = data
  },
  dataset(state, data) {
    state.dataset = data
  },
  summaryDomains(state, data) {
    state.summaryDomains = data
  },
  xGuides(state, data) {
    state.xGuides = data
  },
  emissionDomains(state, data) {
    state.emissionDomains = data
  },
  priceDomains(state, data) {
    state.priceDomains = data
  },
  marketValueDomains(state, data) {
    state.marketValueDomains = data
  },
  temperatureDomains(state, data) {
    state.temperatureDomains = data
  },
  temperatureMeanId(state, data) {
    state.temperatureMeanId = data
  },
  temperatureMinId(state, data) {
    state.temperatureMinId = data
  },
  temperatureMaxId(state, data) {
    state.temperatureMaxId = data
  }
}

export const getters = {
  title: state => state.title,
  description: state => state.description,
  chartEnergy: state => state.chartEnergy,
  chartEmissionsVolume: state => state.chartEmissionsVolume,
  chartEmissionsIntensity: state => state.chartEmissionsIntensity,
  chartPrice: state => state.chartPrice,
  chartTemperature: state => state.chartTemperature,
  summary: state => state.summary,
  legend: state => state.legend,
  stackedAreaDomains: state => state.stackedAreaDomains,
  stackedEnergyPercentDomains: state => state.stackedEnergyPercentDomains,
  dataset: state => state.dataset,
  summaryDomains: state => state.summaryDomains,
  xGuides: state => state.xGuides,
  emissionDomains: state => state.emissionDomains,
  priceDomains: state => state.priceDomains,
  marketValueDomains: state => state.marketValueDomains,
  temperatureDomains: state => state.temperatureDomains,
  temperatureMeanId: state => state.temperatureMeanId,
  temperatureMinId: state => state.temperatureMinId,
  temperatureMaxId: state => state.temperatureMaxId
}

export const actions = {
  title({ commit }, data) {
    commit('title', data)
  },
  description({ commit }, data) {
    commit('description', data)
  },
  chartEnergy({ commit }, data) {
    commit('chartEnergy', data)
  },
  chartEmissionsVolume({ commit }, data) {
    commit('chartEmissionsVolume', data)
  },
  chartEmissionsIntensity({ commit }, data) {
    commit('chartEmissionsIntensity', data)
  },
  chartPrice({ commit }, data) {
    commit('chartPrice', data)
  },
  chartTemperature({ commit }, data) {
    commit('chartTemperature', data)
  },
  summary({ commit }, data) {
    commit('summary', data)
  },
  legend({ commit }, data) {
    commit('legend', data)
  },
  stackedAreaDomains({ commit }, data) {
    commit('stackedAreaDomains', data)
  },
  dataset({ commit }, data) {
    commit('dataset', data)
  },
  summaryDomains({ commit }, data) {
    commit('summaryDomains', data)
  },
  xGuides({ commit }, data) {
    commit('xGuides', data)
  },
  emissionDomains({ commit }, data) {
    commit('emissionDomains', data)
  },
  priceDomains({ commit }, data) {
    commit('priceDomains', data)
  },
  marketValueDomains({ commit }, data) {
    commit('marketValueDomains', data)
  },
  temperatureDomains({ commit }, data) {
    commit('temperatureDomains', data)
  },
  temperatureMeanId({ commit }, data) {
    commit('temperatureMeanId', data)
  },
  temperatureMinId({ commit }, data) {
    commit('temperatureMinId', data)
  },
  temperatureMaxId({ commit }, data) {
    commit('temperatureMaxId', data)
  }
}
