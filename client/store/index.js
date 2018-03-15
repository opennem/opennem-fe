import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  weekStarting: '2017-10-02',
  regionId: 'all',
  zoomedDates: {
    startDate: null,
    endDate: null
  },
  chartZoom: false
}

const mutations = {
  updateWeekStarting (state, data) {
    state.weekStarting = data
  },
  updateRegionId (state, data) {
    state.regionId = data
  },
  updateChartZoom (state, data) {
    state.chartZoom = data
  },
  updateZoomedDates (state, data) {
    state.zoomedDates = data
  }
}

const getters = {
  getWeekStarting: state => {
    return state.weekStarting
  },
  getRegionId: state => {
    return state.regionId
  },
  isChartZoomed: state => {
    return state.chartZoom
  },
  getChartZoomedStartDate: state => {
    return state.zoomedDates.startDate
  },
  getChartZoomedEndDate: state => {
    return state.zoomedDates.endDate
  }
}

const actions = {
  setChartZoom ({ commit, state }, data) {
    commit('updateChartZoom', data)
  },
  setZoomedDates ({ commit, state }, data) {
    commit('updateZoomedDates', data)
  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})

export default store
