export const state = () => ({
  title: '',
  description: '',
  chartEnergy: true,
  chartEmissionsVolume: false,
  chartEmissionsIntensity: false,
  chartPrice: false,
  chartTemperature: false,
  summary: false,
  legend: true
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
  legend: state => state.legend
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
  }
}
