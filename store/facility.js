import _cloneDeep from 'lodash.clonedeep'
import _includes from 'lodash.includes'
import _sortBy from 'lodash.sortby'
import _uniq from 'lodash.uniq'

import axios from 'axios'

import { interpolateRgb, quantize } from 'd3-interpolate'
import { color } from 'd3-color'

import http from '@/services/Api.js'
import PerfTime from '@/plugins/perfTime.js'
import { mutateDate } from '@/services/datetime-helpers.js'
import {
  DEFAULT_FUEL_TECH_COLOUR,
  FUEL_TECH_CATEGORY
} from '@/constants/energy-fuel-techs/group-default.js'
import { isPowerRange, RANGE_7D } from '@/constants/ranges.js'
import { INTERVAL_30MIN } from '@/constants/interval-filters.js'
import { MAP_STYLE_LIGHT } from '@/constants/facilities/map-styles.js'
import regionDisplayTzs from '@/constants/region-display-timezones.js'

import {
  dataProcess,
  dataRollUp,
  dataFilterByPeriod
} from '@/data/parse/facility-energy'
import { getVolWeightedPriceDomains } from '@/data/parse/region-energy/process/getDomains.js'

let request = null

const stationPath = (country, network, facility) =>
  `/station/${country}/${network}/${facility}`
const statsPath = (type, networkRegion, code, query) =>
  `/stats/${type}/station/${networkRegion}/${code}${query}`

function getUnitColour(fuelTech) {
  const unknownColour = '#ccc'
  if (fuelTech) {
    const colour = DEFAULT_FUEL_TECH_COLOUR[fuelTech]
    return colour || unknownColour
  }
  return unknownColour
}

export const state = () => ({
  dataset: [],
  sortBy: 'displayName',
  orderBy: 'asc',
  selectedStatuses: [],
  selectedTechGroups: [],
  selectedTechs: [],
  selectedSizes: [],
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
  filterPeriod: 'All'
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
  selectedSizes(state, data) {
    state.selectedSizes = data
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
  }
}

export const getters = {
  dataset: (state) => _cloneDeep(state.dataset),
  sortBy: (state) => state.sortBy,
  orderBy: (state) => state.orderBy,
  selectedStatuses: (state) => _cloneDeep(state.selectedStatuses),
  selectedTechGroups: (state) => _cloneDeep(state.selectedTechGroups),
  selectedTechs: (state) => _cloneDeep(state.selectedTechs),
  selectedSizes: (state) => _cloneDeep(state.selectedSizes),
  selectedView: (state) => state.selectedView,
  selectedMapStyle: (state) => state.selectedMapStyle,
  filteredFacilities: (state) => state.filteredFacilities,

  previousPath: (state) => state.previousPath,
  fetchingFacility: (state) => state.fetchingFacility,
  fetchingStats: (state) => state.fetchingStats,
  selectedFacility: (state) => _cloneDeep(state.selectedFacility),
  selectedFacilityNetworkRegion: (state) =>
    _cloneDeep(state.selectedFacilityNetworkRegion),
  selectedFacilityUnits: (state) => _cloneDeep(state.selectedFacilityUnits),
  selectedFacilityUnitsDataset: (state) =>
    _cloneDeep(state.selectedFacilityUnitsDataset),
  selectedFacilityUnitsDatasetFlat: (state) =>
    _cloneDeep(state.selectedFacilityUnitsDatasetFlat),
  selectedFacilityError: (state) => state.selectedFacilityError,
  selectedFacilityErrorMessage: (state) => state.selectedFacilityErrorMessage,

  facilityName: (state) =>
    state.selectedFacility && state.selectedFacility.name
      ? state.selectedFacility.name
      : '',
  facilityUnits: (state) =>
    state.selectedFacility
      ? _sortBy(state.selectedFacility.facilities, ['status.code', 'code'])
      : [],
  facilityLocation: (state) =>
    state.selectedFacility ? state.selectedFacility.location : null,
  facilityNetworkRegion: (state) =>
    state.selectedFacility && state.selectedFacility.network
      ? state.selectedFacility.network.code || state.selectedFacility.network
      : '',
  facilityDescription: (state) =>
    state.selectedFacility && state.selectedFacility.description
      ? state.selectedFacility.description
      : '',
  facilityWikiLink: (state) => {
    let link = null

    if (state.selectedFacility) {
      if (state.selectedFacility.website_url) {
        link = {
          type: 'website',
          url: state.selectedFacility.website_url
        }
      } else if (state.selectedFacility.wikipedia_link) {
        link = {
          type: 'wikipedia',
          url: state.selectedFacility.wikipedia_link
        }
      }
    }
    return link
  },
  facilityFuelTechsColours: (state, getters) => {
    const fuelTechs = getters.facilityUnits.map((d) => d.fueltech)

    // get only unique fuel techs
    const uniqFuelTechs = _uniq(fuelTechs.filter((d) => d !== '')).sort()
    const uniqFuelTechsCount = {}
    uniqFuelTechs.forEach((d) => {
      uniqFuelTechsCount[d] = fuelTechs.filter((ft) => ft === d).length
    })

    // set different opacity variations of fuel tech
    const colours = {}
    uniqFuelTechs.forEach((ft) => {
      const colour = color(getUnitColour(ft))
      const count = uniqFuelTechsCount[ft]

      colours[ft] =
        count > 1
          ? quantize(
              interpolateRgb(colour, colour.copy({ opacity: 1 / count + 0.3 })),
              count
            ).reverse()
          : [colour.formatRgb()]
    })

    // apply each colour variation to facility unit
    const obj = {}
    uniqFuelTechs.forEach((ft) => {
      const filter = getters.facilityUnits.filter((d) => {
        const fuelTechCode = d.fueltech.code || d.fueltech
        return d.fueltech && fuelTechCode === ft
      })
      filter.forEach((f, i) => {
        obj[f.code] = colours[ft][i]
      })
    })

    return obj
  },
  unitsSummary: (state, getters) =>
    getters.facilityUnits.map((d, i) => {
      const find = state.domainPowerEnergy.find(
        (domain) => domain.code === d.code
      )
      const findMarketValue = state.domainMarketValue.find(
        (domain) => domain.code === d.code
      )
      const id = find ? find.id : null
      const marketValueId = findMarketValue ? findMarketValue.id : null
      const emissionIntensity = d.emissions_factor_co2 * 1000 // kgCO₂e/MWh
      const displayTz =
        regionDisplayTzs[state.selectedFacility.network.toLowerCase()]
      const dataFirstSeen = d.data_first_seen
        ? mutateDate(d.data_first_seen, displayTz)
        : null
      const dataLastSeen = d.data_last_seen
        ? mutateDate(d.data_last_seen, displayTz)
        : null

      return {
        colour: getters.facilityFuelTechsColours[d.code],
        domain: id,
        id,
        marketValueId,
        emissionIntensity,
        code: d.code,
        label: d.code,
        registeredCapacity: d.capacity_registered,
        status: d.status ? d.status.label || d.status : '',
        fuelTechLabel: d.fueltech,
        category: FUEL_TECH_CATEGORY[d.fueltech],
        dispatchType: d.dispatch_type,
        hasEmissionsFactor: d.emissions_factor_co2,
        dataFirstSeen,
        dataLastSeen
      }
    }),

  domainPowerEnergy: (state) => _cloneDeep(state.domainPowerEnergy),
  domainEmissions: (state) => _cloneDeep(state.domainEmissions),
  domainMarketValue: (state) => _cloneDeep(state.domainMarketValue),
  domainVolWeightedPrices: (state) => _cloneDeep(state.domainVolWeightedPrices),

  dataType: (state) => state.dataType,
  range: (state) => state.range,
  interval: (state) => state.interval,
  filterPeriod: (state) => state.filterPeriod
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
  selectedSizes({ commit }, data) {
    commit('selectedSizes', data)
  },
  selectedView({ commit }, data) {
    commit('selectedView', data)
  },

  doGetFacilityByCode({ commit }, { countryCode, networkCode, facilityCode }) {
    console.log('fetching', countryCode, networkCode, facilityCode)
    const ref = stationPath(
      encodeURIComponent(countryCode),
      encodeURIComponent(networkCode),
      encodeURIComponent(facilityCode)
    )

    commit('fetchingFacility', true)
    commit('selectedFacility', null)
    commit('selectedFacilityNetworkRegion', '')
    commit('selectedFacilityError', false)
    commit('selectedFacilityErrorMessage', '')

    http
      .get(ref)
      .then((response) => {
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
      .catch((e) => {
        const error = e.toJSON()
        const message = `fetch ${error.config.url} error: ${error.message}`
        console.error(message, e.toJSON())
      })
      .then(() => {
        commit('fetchingFacility', false)
      })
  },

  resetSelectedFacilityUnits({ commit }) {
    commit('selectedFacilityUnits', [])
    commit('selectedFacilityUnitsDataset', [])
    commit('selectedFacilityUnitsDatasetFlat', [])
    commit('domainPowerEnergy', [])
    commit('domainEmissions', [])
    commit('domainMarketValue', [])
    commit('domainVolWeightedPrices', [])
  },

  doGetStationStats(
    { commit, getters, rootGetters, dispatch },
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
    commit('dataType', type)
    dispatch('resetSelectedFacilityUnits')

    http
      .get(ref, {
        cancelToken: request.token
      })
      .then((response) => {
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

        const domainObj = (d) => {
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

        codes.forEach((c) => {
          const findPowerEnergy = domainPowerEnergy.find((d) => d.code === c)
          const findEmissions = domainEmissions.find((d) => d.code === c)
          const findMarketValue = domainMarketValue.find((d) => d.code === c)
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
      .catch((e) => {
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
