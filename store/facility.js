import _cloneDeep from 'lodash.clonedeep'
import axios from 'axios'

import PerfTime from '@/plugins/perfTime.js'
import { FACILITY_OPERATING } from '~/constants/facility-status.js'
import { dataProcess } from '@/modules/dataTransform/facility-power'

const http = axios.create({
  baseURL: `/api`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

let useProxy = false
if (typeof window !== 'undefined') {
  const host = window.location.host
  if (host === 'localhost:3000') {
    useProxy = true
  }
}

export const state = () => ({
  dataset: [],
  sortBy: 'displayName',
  orderBy: 'asc',
  selectedStatuses: [FACILITY_OPERATING],
  selectedTechs: [],
  selectedView: 'list',

  previousPath: '',
  fetchingFacility: false,
  fetchingStats: false,
  selectedFacility: null,
  selectedFacilityUnitsDataset: [],
  selectedFacilityInterval: null
})

export const mutations = {
  dataset(state, data) {
    state.dataset = data
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

  previousPath(state, data) {
    state.previousPath = data
  },
  fetchingFacility(state, data) {
    state.fetchingFacility = data
  },
  fetchingStats(state, data) {
    state.fetchingStats = data
  },
  selectedView(state, data) {
    state.selectedView = data
  },
  selectedFacility(state, data) {
    state.selectedFacility = data
  },
  selectedFacilityUnitsDataset(state, data) {
    state.selectedFacilityUnitsDataset = data
  },
  selectedFacilityInterval(state, data) {
    state.selectedFacilityInterval = data
  }
}

export const getters = {
  dataset: state => _cloneDeep(state.dataset),
  sortBy: state => state.sortBy,
  orderBy: state => state.orderBy,
  selectedStatuses: state => state.selectedStatuses,
  selectedTechs: state => state.selectedTechs,
  selectedView: state => state.selectedView,

  previousPath: state => state.previousPath,
  fetchingFacility: state => state.fetchingFacility,
  fetchingStats: state => state.fetchingStats,
  selectedFacility: state => _cloneDeep(state.selectedFacility),
  selectedFacilityUnitsDataset: state =>
    _cloneDeep(state.selectedFacilityUnitsDataset),
  selectedFacilityInterval: state => state.selectedFacilityInterval
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
    const encode = encodeURIComponent(facilityId)
    const ref = useProxy
      ? `/station/${encode}`
      : `https://api.opennem.org.au/station/${encode}`

    commit('fetchingFacility', true)
    commit('selectedFacility', null)

    http
      .get(ref)
      .then(response => {
        console.log('fetched', response.data)

        commit('selectedFacility', response.data)
      })
      .catch(e => {
        const error = e.toJSON()
        const message = `fetch ${error.config.url} error: ${error.message}`
        console.error(message, e.toJSON())
      })
      .then(() => {
        commit('fetchingFacility', false)
      })
  },

  doGetStationStats({ commit }, { networkRegion, facilityId }) {
    const encode = encodeURIComponent(facilityId)
    const ref = useProxy
      ? `/stats/power/station/${networkRegion}/${encode}`
      : `https://api.opennem.org.au/stats/power/station/${networkRegion}/${encode}`

    commit('fetchingStats', true)
    commit('selectedFacilityUnitsDataset', [])
    commit('selectedFacilityInterval', null)

    http
      .get(ref)
      .then(response => {
        console.log('fetched stats', response.data)

        const perf = new PerfTime()
        perf.time()
        console.info(`------ facility data process (start)`)
        const { dataset, interval } = dataProcess(response.data.data)

        commit('selectedFacilityUnitsDataset', dataset)
        commit('selectedFacilityInterval', interval)
        perf.timeEnd(`------ facility data process (end)`)
      })
      .catch(e => {
        const error = e.toJSON()
        const message = `fetch ${error.config.url} error: ${error.message}`
        console.error(message, e.toJSON())
      })
      .then(() => {
        commit('fetchingStats', false)
      })
  }
}
