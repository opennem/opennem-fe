import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import { generateChartData } from '../utils/AmchartsDataTransform'
import { getJSON } from '../utils/Firebase'
import { sumRegionsFuelTech, sumFuelTechByRegion, sumDemandByRegion } from './dataHelpers'

Vue.use(Vuex)

const state = {
  weekStarting: '2017-10-02',
  regionId: 'all',
  generationData: null,
  priceData: null,
  demandData: [],
  ftGenData: [],
  allRegionsFtGenData: null,
  regionFtByGeneratorsData: null,
}

const mutations = {
  updateWeekStarting(state, data) {
    state.weekStarting = data
  },
  updateRegionId(state, data) {
    state.regionId = data
  },
  updateGenerationData(state, data) {
    state.generationData = data
  },
  updatePriceData(state, data) {
    state.priceData = data
  },
  updateDemandData(state, data) {
    state.demandData = data
  },
  updateFtGenData(state, data) {
    state.ftGenData = data
  },
  updateAllRegionsFtGenData(state, data) {
    state.allRegionsFtGenData = data
  },
  updateRegionFtByGeneratorsData(state, data) {
    state.regionFtByGeneratorsData = data
  }
}

const getters = {
  getWeekStarting: state => {
    return state.weekStarting
  },
  getRegionId: state => {
    return state.regionId
  },
  getGenerationData: state => {
    return state.generationData
  },
  getPriceData: state => {
    return state.priceData
  },
  getDemand: state => {
    return state.demandData
  },
  getFtGen: state => {
    return state.ftGenData
  },
  getAllRegionsFtGen: state => {
    return state.allRegionsFtGenData
  },
  getRegionFtByGeneratorsData: state => {
    return state.regionFtByGeneratorsData
  }
}

const actions = {
  fetchData({ commit, state }, data) {
    const week = state.weekStarting
    const fetchGen = getJSON(`${week}/gen_5m_${data.region}1.json`)
    const fetchDispatch = getJSON(`${week}/dispatch_5m_${data.region}1.json`)
    const fetchPrice = getJSON(`${week}/price_30m_${data.region}1.json`)

    axios.all([fetchGen, fetchDispatch, fetchPrice])
      .then(axios.spread((gen, dispatch, price) => {
        const data = Object.assign(gen.data, dispatch.data)
        commit('updateGenerationData', data)
        commit('updatePriceData', price.data)
      })
    )
  },

  fetchAllRegionsFtGen({ commit, state }, data) {
    const week = state.weekStarting
    const fetchNsw = getJSON(`${week}/gen_5m_nsw1.json`)
    const fetchQld = getJSON(`${week}/gen_5m_qld1.json`)
    const fetchSa = getJSON(`${week}/gen_5m_sa1.json`)
    const fetchTas = getJSON(`${week}/gen_5m_tas1.json`)
    const fetchVic = getJSON(`${week}/gen_5m_vic1.json`)

    axios.all([fetchNsw, fetchQld, fetchSa, fetchTas, fetchVic])
      .then(axios.spread((nsw, qld, sa, tas, vic) => {
        const data = sumRegionsFuelTech({
          'nsw': nsw.data,
          'qld': qld.data,
          'sa': sa.data,
          'tas': tas.data,
          'vic': vic.data
        })

        commit('updateAllRegionsFtGenData', generateChartData(data))
      })
    )
  },

  fetchFtGen({ commit, state }, data) {
    const week = state.weekStarting
    const fetchNsw = getJSON(`${week}/gen_5m_nsw1.json`)
    const fetchQld = getJSON(`${week}/gen_5m_qld1.json`)
    const fetchSa = getJSON(`${week}/gen_5m_sa1.json`)
    const fetchTas = getJSON(`${week}/gen_5m_tas1.json`)
    const fetchVic = getJSON(`${week}/gen_5m_vic1.json`)

    axios.all([fetchNsw, fetchQld, fetchSa, fetchTas, fetchVic])
      .then(axios.spread((nsw, qld, sa, tas, vic) => {
        const data = sumFuelTechByRegion({
          'nsw': nsw.data,
          'qld': qld.data,
          'sa': sa.data,
          'tas': tas.data,
          'vic': vic.data
        })

        commit('updateFtGenData', data)
      })
    )
  },

  fetchDemand({ commit, state }, data) {
    const week = state.weekStarting
    const fetchNsw = getJSON(`${week}/dispatch_5m_nsw1.json`)
    const fetchQld = getJSON(`${week}/dispatch_5m_qld1.json`)
    const fetchSa = getJSON(`${week}/dispatch_5m_sa1.json`)
    const fetchTas = getJSON(`${week}/dispatch_5m_tas1.json`)
    const fetchVic = getJSON(`${week}/dispatch_5m_vic1.json`)

    axios.all([fetchNsw, fetchQld, fetchSa, fetchTas, fetchVic])
      .then(axios.spread((nsw, qld, sa, tas, vic) => {
        const data = sumDemandByRegion({
          'nsw': nsw.data,
          'qld': qld.data,
          'sa': sa.data,
          'tas': tas.data,
          'vic': vic.data
        })

        commit('updateDemandData', data)
      })
    )
  },

  fetchRegionFtByGeneratorsData({ commit, state }, data) {
    const week = state.weekStarting
    const getGenerators = getJSON(`${week}/gen_5m_${data.region}1_${data.ft}.json`)

    getGenerators.then(generators => {
      let res = generators.data
      if (typeof generators.data === 'string') {
        res = generators.data.replace(/NaN/g, 'null')
        res = JSON.parse(res)
      }
      commit('updateRegionFtByGeneratorsData', res)
    })
  },
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})

export default store
