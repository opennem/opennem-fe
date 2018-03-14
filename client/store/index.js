import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  weekStarting: '2017-10-02',
  regionId: 'all',
  chartZoomed: false
}

const mutations = {
  updateWeekStarting (state, data) {
    state.weekStarting = data
  },
  updateRegionId (state, data) {
    state.regionId = data
  },
  updateChartZoomed (state, data) {
    state.chartZoomed = data
  }
}

const getters = {
  getWeekStarting: state => {
    return state.weekStarting
  },
  getRegionId: state => {
    return state.regionId
  },
  getChartZoomed: state => {
    return state.chartZoomed
  }
}

const actions = {
  setChartZoomed ({ commit, state }, data) {
    commit('updateChartZoomed', data.chartZoomed)
  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})

export default store
