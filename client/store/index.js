import Vue from 'vue'
import Vuex from 'vuex'
import axios from "axios"

Vue.use(Vuex)

const state = {
  generationData: null,
  priceData: null
}

const mutations = {
  updateGenerationData(state, data) {
    state.generationData = data
  },
  updatePriceData(state, data) {
    state.priceData = data
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
  fetchData({commit}, region) {
    const fetchGen = axios.get(`/data/all_${region}.json`)
    const fetchPrice = axios.get(`/data/price_30m_${region}.json`)
    
    axios.all([fetchGen, fetchPrice])
      .then(axios.spread(function (gen, price) {
        commit('updateGenerationData', gen.data)
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
