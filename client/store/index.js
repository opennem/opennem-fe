import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  weekStarting: '2017-10-02',
  regionId: 'all'
}

const mutations = {
  updateWeekStarting (state, data) {
    state.weekStarting = data
  },
  updateRegionId (state, data) {
    state.regionId = data
  }
}

const getters = {
  getWeekStarting: state => {
    return state.weekStarting
  },
  getRegionId: state => {
    return state.regionId
  }
}

const actions = {}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})

export default store
