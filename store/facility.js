import _cloneDeep from 'lodash.clonedeep'
import axios from 'axios'

// import http from '@/services/Http.js'
import { FACILITY_OPERATING } from '~/constants/facility-status.js'

const http = axios.create({
  baseURL: `/api`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

export const state = () => ({
  dataset: [],
  sortBy: 'displayName',
  orderBy: 'asc',
  selectedStatuses: [FACILITY_OPERATING],
  selectedTechs: [],
  selectedView: 'list',

  selectedFacility: null
})

export const mutations = {
  dataset(state, data) {
    state.dataset = _cloneDeep(data)
  },
  sortBy(state, data) {
    state.sortBy = data
  },
  orderBy(state, data) {
    state.orderBy = data
  },
  selectedStatuses(state, data) {
    state.selectedStatuses = data
  },
  selectedTechs(state, data) {
    state.selectedTechs = data
  },
  selectedView(state, data) {
    state.selectedView = data
  },
  selectedFacility(state, data) {
    state.selectedFacility = data
  }
}

export const getters = {
  dataset: state => state.dataset,
  sortBy: state => state.sortBy,
  orderBy: state => state.orderBy,
  selectedStatuses: state => state.selectedStatuses,
  selectedTechs: state => state.selectedTechs,
  selectedView: state => state.selectedView,

  selectedFacility: state => _cloneDeep(state.selectedFacility)
}

export const actions = {
  dataset({ commit }, data) {
    commit('dataset', data)
  },
  sortBy({ commit }, data) {
    commit('sortBy', data)
  },
  orderBy({ commit }, data) {
    commit('orderBy', data)
  },
  selectedStatuses({ commit }, data) {
    commit('selectedStatuses', data)
  },
  selectedTechs({ commit }, data) {
    commit('selectedTechs', data)
  },
  selectedView({ commit }, data) {
    commit('selectedView', data)
  },

  doGetFacilityById({ commit }, { facilityId }) {
    console.log('fetching', facilityId)
    // const urls = [
    //   `https://api.opennem.org.au/station/${facilityId}?history_include=true`
    // ]
    const ref = `/${facilityId}?history_include=true`
    // http(urls).then(responses => {
    //   console.log('fetched', responses[0])
    //   commit('selectedFacility', responses[0])
    // })

    http
      .get(ref)
      .then(response => {
        console.log('fetched', response, response.data)
        commit('selectedFacility', response.data)
      })
      .catch(e => {
        const error = e.toJSON()
        const message = `fetch ${error.config.url} error: ${error.message}`
        console.error(message, e.toJSON())
      })
  }
}
