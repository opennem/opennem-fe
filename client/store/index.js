import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import * as moment from 'moment'
import * as _ from 'lodash'

import { calculateHorizonValues, generateChartData } from '../utils/AmchartsDataTransform'
import { REGIONS, FUEL_TECH_GROUPS, FUEL_TECH } from '../utils/FuelTechConfig'
import { FirebaseStorage } from '../utils/Firebase'

Vue.use(Vuex)

// Get a reference to the storage service, which is used to create references in your storage bucket
let storage = FirebaseStorage

const http = axios.create({
	baseURL: '/',
})

const state = {
  weekStarting: '2017-10-14',
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
  fetchData({commit, state}, data) {
    const week = state.weekStarting
    const getGenURL = storage.ref(`${week}/gen_5m_${data.region}.json`).getDownloadURL()
    const getDispatchURL = storage.ref(`${week}/dispatch_5m_${data.region}.json`).getDownloadURL()
    const getPriceURL = storage.ref(`${week}/price_30m_${data.region}.json`).getDownloadURL()

    Promise.all([getGenURL, getDispatchURL, getPriceURL]).then(urls => {
      const fetchGen = http.get(urls[0])
      const fetchDispatch = http.get(urls[1])
      const fetchPrice = http.get(urls[2])
      
      axios.all([fetchGen, fetchDispatch, fetchPrice])
        .then(axios.spread(function (gen, dispatch, price) {
          commit('updateGenerationData', Object.assign(gen.data, dispatch.data))
          commit('updatePriceData', price.data)
        }))
    })
  },
  fetchAllRegionsFtGen({commit, state}, data) {
    const week = state.weekStarting

    const fetchNsw = storage.ref(`${week}/gen_5m_nsw1.json`).getDownloadURL()
    const fetchQld = storage.ref(`${week}/gen_5m_qld1.json`).getDownloadURL()
    const fetchSa = storage.ref(`${week}/gen_5m_sa1.json`).getDownloadURL()
    const fetchTas = storage.ref(`${week}/gen_5m_tas1.json`).getDownloadURL()
    const fetchVic = storage.ref(`${week}/gen_5m_vic1.json`).getDownloadURL()

    Promise.all([fetchNsw, fetchQld, fetchSa, fetchTas, fetchVic]).then(urls => {

      const fetchGen1 = http.get(urls[0])
      const fetchGen2 = http.get(urls[1])
      const fetchGen3 = http.get(urls[2])
      const fetchGen4 = http.get(urls[3])
      const fetchGen5 = http.get(urls[4])
  
      axios.all([fetchGen1, fetchGen2, fetchGen3, fetchGen4, fetchGen5])
      .then(axios.spread(function (gen1, gen2, gen3, gen4, gen5) {
        const regionData = {
          'nsw': gen1.data,
          'qld': gen2.data,
          'sa': gen3.data,
          'tas': gen4.data,
          'vic': gen5.data
        }
        let data = null

        console.log(regionData)

        Object.keys(regionData).forEach((regionKey, regionIndex) => {
          const regionFtData = regionData[regionKey]
          if (!data) {
            data = _.cloneDeep(regionFtData)
          } else {
            data = _.mergeWith(data, regionFtData, function(objValue, srcValue) {
              if (objValue) {
                const objData = objValue.data
                const srcData = srcValue.data

                objData.forEach((value, index) => {
                  objData[index] = value + srcData[index]
                })

                objValue.data = objData

                return objValue
              } else {
                return srcValue
              }
            })
          }
        })
        
        commit('updateAllRegionsFtGenData', generateChartData(data))
      }))
    })
    
  },
  fetchFtGen({commit, state}, data) {
    const week = state.weekStarting

    const fetchNsw = storage.ref(`${week}/gen_5m_nsw1.json`).getDownloadURL()
    const fetchQld = storage.ref(`${week}/gen_5m_qld1.json`).getDownloadURL()
    const fetchSa = storage.ref(`${week}/gen_5m_sa1.json`).getDownloadURL()
    const fetchTas = storage.ref(`${week}/gen_5m_tas1.json`).getDownloadURL()
    const fetchVic = storage.ref(`${week}/gen_5m_vic1.json`).getDownloadURL()

    Promise.all([fetchNsw, fetchQld, fetchSa, fetchTas, fetchVic]).then(urls => {

      const fetchGen1 = http.get(urls[0])
      const fetchGen2 = http.get(urls[1])
      const fetchGen3 = http.get(urls[2])
      const fetchGen4 = http.get(urls[3])
      const fetchGen5 = http.get(urls[4])
  
      axios.all([fetchGen1, fetchGen2, fetchGen3, fetchGen4, fetchGen5])
      .then(axios.spread(function (gen1, gen2, gen3, gen4, gen5) {
        const regionData = {
          'nsw': gen1.data,
          'qld': gen2.data,
          'sa': gen3.data,
          'tas': gen4.data,
          'vic': gen5.data
        }
        const data = []
        
        REGIONS.forEach(region => {
          const ftRegionObj = {
            regionId: region.id
          }
          let total = 0

          Object.keys(FUEL_TECH).forEach(((key, index) => {
            if (key !== 'NETINTERCHANGE') {
              // ignore NETINTERCHANGE
              const ft = regionData[region.id][key]
              const ftTotal = ft ? ft.data.reduce((a, b) => a + b, 0) : 0
              total += ftTotal
              ftRegionObj[key] = ftTotal
            }
          }))

          total = total.toFixed(0)

          Object.keys(ftRegionObj).forEach((key) => {
            if (key !== 'regionId') {
              ftRegionObj[key] = ftRegionObj[key]/total*100
            }
          })

          data.push(ftRegionObj)          
        })
        commit('updateFtGenData', data)
      }))
    })
    
  },
  fetchDemand({commit, state}, data) {
    const week = state.weekStarting
    const fetchNsw = storage.ref(`${week}/dispatch_5m_nsw1.json`).getDownloadURL()
    const fetchQld = storage.ref(`${week}/dispatch_5m_qld1.json`).getDownloadURL()
    const fetchSa = storage.ref(`${week}/dispatch_5m_sa1.json`).getDownloadURL()
    const fetchTas = storage.ref(`${week}/dispatch_5m_tas1.json`).getDownloadURL()
    const fetchVic = storage.ref(`${week}/dispatch_5m_vic1.json`).getDownloadURL()

    Promise.all([fetchNsw, fetchQld, fetchSa, fetchTas, fetchVic]).then(urls => {
      const fetchDispatch1 = http.get(urls[0])
      const fetchDispatch2 = http.get(urls[1])
      const fetchDispatch3 = http.get(urls[2])
      const fetchDispatch4 = http.get(urls[3])
      const fetchDispatch5 = http.get(urls[4])
      
      axios.all([fetchDispatch1, fetchDispatch2, fetchDispatch3, fetchDispatch4, fetchDispatch5])
        .then(axios.spread(function (dispatch1, dispatch2, dispatch3, dispatch4, dispatch5) {
          const key = 'DEMAND_AND_NONSCHEDGEN'
          const demand = []
          const nswDemand = dispatch1.data[key]
          const nswDemandData = nswDemand.data
          const qldDemandData = dispatch2.data[key].data
          const saDemandData = dispatch3.data[key].data
          const tasDemandData = dispatch4.data[key].data
          const vicDemandData = dispatch5.data[key].data
          const interval = '5'
          const start = moment(nswDemand.start, moment.ISO_8601)
    
          for (let i=0; i<nswDemandData.length; i++) {
            const now = moment(start).add(interval*i, 'm')
  
            const nsw = calculateHorizonValues(nswDemandData[i])
            const qld = calculateHorizonValues(qldDemandData[i])
            const sa = calculateHorizonValues(saDemandData[i])
            const tas = calculateHorizonValues(tasDemandData[i])
            const vic = calculateHorizonValues(vicDemandData[i])
            
            demand[i] = {
              date: now.toDate(),
              nsw: nswDemandData[i],
              nswMid: 0.5,
              nsw1: nsw[0],
              nsw2: nsw[1],
              nsw3: nsw[2],            
              qld: qldDemandData[i],
              qldMid: 0.5,
              qld1: qld[0],
              qld2: qld[1],
              qld3: qld[2], 
              sa: saDemandData[i],
              saMid: 0.5,
              sa1: sa[0],
              sa2: sa[1],
              sa3: sa[2], 
              tas: tasDemandData[i],
              tasMid: 0.5,
              tas1: tas[0],
              tas2: tas[1],
              tas3: tas[2], 
              vic: vicDemandData[i],
              vicMid: 0.5,
              vic1: vic[0],
              vic2: vic[1],
              vic3: vic[2]
            }
          }
          commit('updateDemandData', demand)
        })
      )
    })
  },
  fetchRegionFtByGeneratorsData({commit, state}, data) {
    const week = state.weekStarting
    const getURL = storage.ref(`${week}/gen_5m_${data.region}1_${data.ft}.json`).getDownloadURL()

    getURL.then(url => {
      http.get(url).then(generators => {
        console.log(generators)
        console.log(typeof generators.data)
        let res = generators.data

        if (typeof generators.data === 'string') {
          res = generators.data.replace(/NaN/g, 'null')
          res = JSON.parse(res)
        }
        commit('updateRegionFtByGeneratorsData', res)
      })
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
