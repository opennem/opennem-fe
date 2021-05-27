import _cloneDeep from 'lodash.clonedeep'
import _includes from 'lodash.includes'
import axios from 'axios'

import PerfTime from '@/plugins/perfTime.js'
import { FACILITY_OPERATING } from '@/constants/facility-status.js'
import { isPowerRange, RANGE_7D } from '@/constants/ranges.js'
import { INTERVAL_30MIN } from '@/constants/interval-filters.js'
import { MAP_STYLE_LIGHT } from '@/constants/facilities/map-styles.js'

import {
  dataProcess,
  dataRollUp,
  dataFilterByPeriod
} from '@/data/parse/facility-energy'
import { getVolWeightedPriceDomains } from '@/data/parse/region-energy/process/getDomains.js'

let request = null

const getApiBaseUrl = () => {
  let apiBaseUrl = `https://api.opennem.org.au`
  let host = undefined
  if (typeof window !== 'undefined') {
    host = window.location.host
  }

  if (
    host &&
    (host === 'localhost:3000' ||
      host.startsWith('127') ||
      host.startsWith('192'))
  ) {
    apiBaseUrl = `/api`
    // apiBaseUrl = `/`
  }

  if (host && host.startsWith('dev')) {
    apiBaseUrl = `https://api.dev.opennem.org.au`
  }

  if (process.env.API_BASE_URL !== undefined) {
    apiBaseUrl = process.env.API_BASE_URL
  }

  console.info('apiBaseUrl', apiBaseUrl)

  return apiBaseUrl
}

const http = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

const stationPath = (country, network, facility) =>
  `/station/${country}/${network}/${facility}`
const statsPath = (type, networkRegion, code, query) =>
  `/stats/${type}/station/${networkRegion}/${code}${query}`

export const state = () => ({
  dataset: [],
  sortBy: 'displayName',
  orderBy: 'asc',
  selectedStatuses: [FACILITY_OPERATING],
  selectedTechGroups: [],
  selectedTechs: [],
  selectedSize: [],
  selectedView: 'list',
  selectedMapStyle: MAP_STYLE_LIGHT,
  filteredFacilities: [],

  previousPath: '',
  fetchingFacility: false,
  fetchingStats: false,
  selectedFacility: null,
  selectedFacilityNetworkRegion: '',
  selectedFacilityUnits: [],
  selectedFacilityUnitsDataset: [],
  selectedFacilityUnitsDatasetFlat: [], // as returned transform
  selectedFacilityError: false,
  selectedFacilityErrorMessage: false,

  domainPowerEnergy: [],
  domainEmissions: [],
  domainMarketValue: [],
  domainVolWeightedPrices: [],

  dataType: 'power', // power, energy
  range: RANGE_7D,
  interval: INTERVAL_30MIN,
  filterPeriod: 'All',

  showFields: false,
  selectedFields: []
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
  selectedSize(state, data) {
    state.selectedSize = data
  },
  selectedTechGroups(state, data) {
    state.selectedTechGroups = data
  },
  selectedTechs(state, data) {
    state.selectedTechs = data
  },
  selectedMapStyle(state, data) {
    state.selectedMapStyle = data
  },
  filteredFacilities(state, data) {
    state.filteredFacilities = data
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
  selectedFacilityNetworkRegion(state, data) {
    state.selectedFacilityNetworkRegion = data
  },
  selectedFacilityUnits(state, data) {
    state.selectedFacilityUnits = data
  },
  selectedFacilityUnitsDataset(state, data) {
    state.selectedFacilityUnitsDataset = data
  },
  selectedFacilityUnitsDatasetFlat(state, data) {
    state.selectedFacilityUnitsDatasetFlat = data
  },
  selectedFacilityError(state, data) {
    state.selectedFacilityError = data
  },
  selectedFacilityErrorMessage(state, data) {
    state.selectedFacilityErrorMessage = data
  },

  domainPowerEnergy(state, data) {
    state.domainPowerEnergy = data
  },
  domainEmissions(state, data) {
    state.domainEmissions = data
  },
  domainMarketValue(state, data) {
    state.domainMarketValue = data
  },
  domainVolWeightedPrices(state, data) {
    state.domainVolWeightedPrices = data
  },

  dataType(state, data) {
    state.dataType = data
  },
  range(state, data) {
    state.range = data
  },
  interval(state, data) {
    state.interval = data
  },
  filterPeriod(state, data) {
    state.filterPeriod = data
  },

  showFields(state, data) {
    state.showFields = data
  },
  selectedFields(state, data) {
    state.selectedFields = data
  }
}

export const getters = {
  dataset: state => _cloneDeep(state.dataset),
  sortBy: state => state.sortBy,
  orderBy: state => state.orderBy,
  selectedStatuses: state => _cloneDeep(state.selectedStatuses),
  selectedTechGroups: state => _cloneDeep(state.selectedTechGroups),
  selectedTechs: state => _cloneDeep(state.selectedTechs),
  selectedSize: state => _cloneDeep(state.selectedSize),
  selectedView: state => state.selectedView,
  selectedMapStyle: state => state.selectedMapStyle,
  filteredFacilities: state => state.filteredFacilities,

  previousPath: state => state.previousPath,
  fetchingFacility: state => state.fetchingFacility,
  fetchingStats: state => state.fetchingStats,
  selectedFacility: state => _cloneDeep(state.selectedFacility),
  selectedFacilityNetworkRegion: state =>
    _cloneDeep(state.selectedFacilityNetworkRegion),
  selectedFacilityUnits: state => _cloneDeep(state.selectedFacilityUnits),
  selectedFacilityUnitsDataset: state =>
    _cloneDeep(state.selectedFacilityUnitsDataset),
  selectedFacilityUnitsDatasetFlat: state =>
    _cloneDeep(state.selectedFacilityUnitsDatasetFlat),
  selectedFacilityError: state => state.selectedFacilityError,
  selectedFacilityErrorMessage: state => state.selectedFacilityErrorMessage,

  domainPowerEnergy: state => _cloneDeep(state.domainPowerEnergy),
  domainEmissions: state => _cloneDeep(state.domainEmissions),
  domainMarketValue: state => _cloneDeep(state.domainMarketValue),
  domainVolWeightedPrices: state => _cloneDeep(state.domainVolWeightedPrices),

  dataType: state => state.dataType,
  range: state => state.range,
  interval: state => state.interval,
  filterPeriod: state => state.filterPeriod,

  showFields: state => state.showFields,
  selectedFields: state => _cloneDeep(state.selectedFields)
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
  selectedSize({ commit }, data) {
    commit('selectedSize', data)
  },
  selectedView({ commit }, data) {
    commit('selectedView', data)
  },

  addField({ commit, state }, field) {
    const fields = _cloneDeep(state.selectedFields)
    const find = fields.find(f => f.key === field.key)
    if (!find) {
      fields.push(field)
      commit('selectedFields', fields)
    }
  },

  removeIssueField({ commit, state }, field) {
    const fields = state.selectedFields.filter(f => f.key !== field.key)
    commit('selectedFields', fields)
  },

  clearIssueFields({ commit }) {
    commit('selectedFields', [])
  },

  doGetFacilityByCode({ commit }, { countryCode, networkCode, facilityCode }) {
    console.log('fetching', countryCode, networkCode, facilityCode)
    const ref = stationPath(
      encodeURIComponent(countryCode),
      encodeURIComponent(networkCode),
      encodeURIComponent(facilityCode)
    )
    // const ref = '/test-data/BAYSW.json'

    commit('fetchingFacility', true)
    commit('selectedFacility', null)
    commit('selectedFacilityNetworkRegion', '')
    commit('selectedFacilityError', false)
    commit('selectedFacilityErrorMessage', '')

    http
      .get(ref)
      .then(response => {
        console.log('fetched', response.data)
        const networkCode = response.data.network
          ? response.data.network.code || response.data.network
          : ''
        commit('selectedFacility', response.data)
        commit('selectedFacilityNetworkRegion', networkCode)

        // Error handling
        if (response.response_status === 'ERROR') {
          commit('selectedFacilityError', true)
          commit('selectedFacilityErrorMessage', response.detail)
        }
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

  doGetStationStats(
    { commit, getters, rootGetters },
    { networkRegion, facilityCode, facilityFuelTechsColours }
  ) {
    const displayTz = rootGetters.displayTimeZone
    const encode = encodeURIComponent(facilityCode)
    let range = getters.range
    let interval = getters.interval

    let period = range
    if (range === '30D') {
      if (interval === '30m') {
        period = '1M&interval=30m'
      } else {
        period = '1M&interval=1d'
      }
    }
    if (range === '1Y') {
      period = '1Y&interval=1d'
    }
    if (range === 'ALL') {
      period = 'all&interval=1M'
    }

    const type = isPowerRange(range) ? 'power' : 'energy'
    const query = isPowerRange(range) ? '?period=7d' : `?period=${period}`
    const ref = statsPath(type, networkRegion, encode, query)
    // const ref = '/test-data/BAYSW_All_1M.json'

    if (request) {
      request.cancel('Operation cancelled by the user.')
    }

    request = axios.CancelToken.source()

    commit('fetchingStats', true)
    commit('selectedFacilityUnitsDataset', [])
    commit('selectedFacilityUnitsDatasetFlat', [])
    commit('selectedFacilityUnits', [])
    commit('domainPowerEnergy', [])
    commit('domainEmissions', [])
    commit('domainMarketValue', [])
    commit('domainVolWeightedPrices', [])
    commit('dataType', type)

    http
      .get(ref, {
        cancelToken: request.token
      })
      .then(response => {
        console.log('fetched stats', response.data)

        range = getters.range
        interval = getters.interval
        let filterPeriod = getters.filterPeriod

        const perf = new PerfTime()
        perf.time()
        console.info(`------ facility data process (start)`)
        const {
          dataset,
          datasetFlat,
          domainPowerEnergy,
          domainEmissions,
          domainMarketValue
        } = dataProcess(response.data.data, range, interval, displayTz)

        const domainObj = d => {
          return {
            colour: facilityFuelTechsColours[d.code],
            domain: d.id,
            id: d.id,
            code: d.code,
            label: d.code,
            type: d.type,
            units: d.units
          }
        }
        const codes = Object.keys(facilityFuelTechsColours)
        const mappedDomainPowerEnergy = [],
          mappedDomainEmissions = [],
          mappedDomainMarketValue = []

        codes.forEach(c => {
          const findPowerEnergy = domainPowerEnergy.find(d => d.code === c)
          const findEmissions = domainEmissions.find(d => d.code === c)
          const findMarketValue = domainMarketValue.find(d => d.code === c)
          if (findPowerEnergy) {
            mappedDomainPowerEnergy.push(domainObj(findPowerEnergy))
          }
          if (findEmissions) {
            mappedDomainEmissions.push(domainObj(findEmissions))
          }
          if (findMarketValue) {
            mappedDomainMarketValue.push(domainObj(findMarketValue))
          }
        })

        const filtered = dataFilterByPeriod({
          dataset,
          interval,
          period: filterPeriod
        })

        commit('selectedFacilityUnitsDataset', filtered)
        commit('selectedFacilityUnitsDatasetFlat', datasetFlat)
        commit('selectedFacilityUnits', domainPowerEnergy)
        commit('domainPowerEnergy', mappedDomainPowerEnergy.reverse())
        commit('domainEmissions', mappedDomainEmissions.reverse())
        commit('domainMarketValue', mappedDomainMarketValue.reverse())
        commit(
          'domainVolWeightedPrices',
          domainMarketValue.length > 0 ? getVolWeightedPriceDomains() : []
        )

        perf.timeEnd(`------ facility data process (end)`)
        request = null

        const version = response.data.version
        commit('app/apiVersion', version && version !== '' ? version : null, {
          root: true
        })
        commit('fetchingStats', false)
      })
      .catch(e => {
        if (axios.isCancel(e)) {
          console.log('Request cancelled', e.message)
        } else {
          const error = e
          // const message = `fetch ${error.config.url} error: ${error.message}`
          console.error(e)
          request = null
          commit('fetchingStats', false)
        }
      })
  },

  doUpdateDatasetByInterval({ commit, getters }, interval) {
    const type = getters.dataType
    const units = getters.selectedFacilityUnits
    const datasetFlat = getters.selectedFacilityUnitsDatasetFlat
    const domainPowerEnergy = getters.domainPowerEnergy
    const domainEmissions = getters.domainEmissions
    const domainMarketValue = getters.domainMarketValue
    const dataset = dataRollUp({
      datasetFlat,
      domainPowerEnergy,
      domainEmissions,
      domainMarketValue,
      interval,
      isEnergyType: type === 'energy'
    })

    commit('selectedFacilityUnitsDataset', dataset)
  },

  doUpdateDatasetByFilterPeriod(
    { getters, commit },
    { range, interval, period }
  ) {
    // console.log('****** doUpdateDatasetByFilterPeriod', range, interval, period)

    const type = getters.dataType
    const units = getters.selectedFacilityUnits
    const datasetFlat = getters.selectedFacilityUnitsDatasetFlat
    const domainPowerEnergy = getters.domainPowerEnergy
    const domainEmissions = getters.domainEmissions
    const domainMarketValue = getters.domainMarketValue

    const dataset = dataRollUp({
      datasetFlat,
      domainPowerEnergy,
      domainEmissions,
      domainMarketValue,
      interval,
      isEnergyType: type === 'energy'
    })

    const filtered = dataFilterByPeriod({
      dataset,
      interval,
      period
    })

    commit('selectedFacilityUnitsDataset', filtered)
  }
}
