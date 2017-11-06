import Vue from 'vue'
import Vuex from 'vuex'
import axios from "axios"

Vue.use(Vuex)

const state = {
  weekStarting: '',
  generationData: null,
  priceData: null
}

const mutations = {
  updateGenerationData(state, data) {
    state.generationData = data
  },
  updatePriceData(state, data) {
    state.priceData = data
  },
  updateWeekStarting(state, data) {
    state.weekStarting = data
  }
}

const getters = {
  getGenerationData: state => {
    return state.generationData
  },
  getPriceData: state => {
    return state.priceData
  }
}

const actions = {
  fetchData({commit}, data) {
    const fetchGen = axios.get(`/data/${data.week}/gen_5m_${data.region}.json`)
    const fetchDispatch = axios.get(`/data/${data.week}/dispatch_5m_${data.region}.json`)
    const fetchPrice = axios.get(`/data/${data.week}/price_30m_${data.region}.json`)
    // const fetchGen = axios.get(`/samples/combined_sample.json`)
    // const fetchPrice = axios.get(`/samples/combined_sample.json`)
    
    axios.all([fetchGen, fetchDispatch, fetchPrice])
      .then(axios.spread(function (gen, dispatch, price) {
        commit('updateGenerationData', Object.assign(gen.data, dispatch.data))
        commit('updatePriceData', price.data)
      }));
  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})

export default store
