import _cloneDeep from 'lodash.clonedeep'
import PerfTime from '@/plugins/perfTime.js'
import http from '@/services/Http.js'
import Data from '@/services/Data.js'
import { dataProcess, dataRollUp } from '@/modules/dataTransform/energy'
import { isValidRegion } from '@/constants/v2/energy-regions.js'

export const state = () => ({
  ready: false,
  isFetching: false,
  isEnergyType: false,
  jsonResponses: null,
  datasetFlat: [],
  currentDatasetFlat: [],
  domainPowerEnergy: [],
  domainPowerEnergyGrouped: [],
  domainEmissions: [],
  domainEmissionsGrouped: [],
  domainPriceMarketValue: [],
  domainVolWeightedPriceDomains: [],
  domainTemperature: [],
  currentDomainPowerEnergy: [],
  filteredSummary: null
})

export const getters = {
  ready: state => state.ready,
  isFetching: state => state.isFetching,
  isEnergyType: state => state.isEnergyType,
  datasetFlat: state => state.datasetFlat,
  currentDatasetFlat: state => state.currentDatasetFlat,
  domainPowerEnergy: state => state.domainPowerEnergy,
  domainPowerEnergyGrouped: state => state.domainPowerEnergyGrouped,
  domainEmissions: state => state.domainEmissions,
  domainEmissionsGrouped: state => state.domainEmissionsGrouped,
  domainPriceMarketValue: state => state.domainPriceMarketValue,
  domainVolWeightedPriceDomains: state => state.domainVolWeightedPriceDomains,
  domainTemperature: state => state.domainTemperature,
  currentDomainPowerEnergy: state => state.currentDomainPowerEnergy,
  filteredSummary: state => state.filteredSummary
}

export const mutations = {
  ready(state, ready) {
    state.ready = ready
  },
  isFetching(state, isFetching) {
    state.isFetching = isFetching
  },
  isEnergyType(state, isEnergyType) {
    state.isEnergyType = isEnergyType
  },
  jsonResponses(state, jsonResponses) {
    state.jsonResponses = _cloneDeep(jsonResponses)
  },
  datasetFlat(state, datasetFlat) {
    state.datasetFlat = _cloneDeep(datasetFlat)
  },
  currentDatasetFlat(state, currentDatasetFlat) {
    state.currentDatasetFlat = _cloneDeep(currentDatasetFlat)
  },
  domainPowerEnergy(state, domainPowerEnergy) {
    state.domainPowerEnergy = _cloneDeep(domainPowerEnergy)
  },
  domainPowerEnergyGrouped(state, domainPowerEnergyGrouped) {
    state.domainPowerEnergyGrouped = _cloneDeep(domainPowerEnergyGrouped)
  },
  domainEmissions(state, domainEmissions) {
    state.domainEmissions = _cloneDeep(domainEmissions)
  },
  domainEmissionsGrouped(state, domainEmissionsGrouped) {
    state.domainEmissionsGrouped = _cloneDeep(domainEmissionsGrouped)
  },
  domainPriceMarketValue(state, domainPriceMarketValue) {
    state.domainPriceMarketValue = _cloneDeep(domainPriceMarketValue)
  },
  domainVolWeightedPriceDomains(state, domainVolWeightedPriceDomains) {
    state.domainVolWeightedPriceDomains = _cloneDeep(
      domainVolWeightedPriceDomains
    )
  },
  domainTemperature(state, domainTemperature) {
    state.domainTemperature = _cloneDeep(domainTemperature)
  },
  currentDomainPowerEnergy(state, currentDomainPowerEnergy) {
    state.currentDomainPowerEnergy = _cloneDeep(currentDomainPowerEnergy)
  },
  filteredSummary(state, filteredSummary) {
    state.filteredSummary = _cloneDeep(filteredSummary)
  }
}

export const actions = {
  doGetRegionData({ commit }, { region, range, interval, groupName }) {
    if (isValidRegion(region)) {
      const urls = Data.getEnergyUrls(region, range, 'prod')
      commit('ready', false)
      commit('isFetching', true)

      http(urls).then(responses => {
        const perf = new PerfTime()
        perf.time()
        console.info(`${region} — ${range}/${interval} (start) ------`)

        const {
          datasetFlat,
          currentDatasetFlat,
          domainPowerEnergy,
          domainPowerEnergyGrouped,
          domainEmissions,
          domainEmissionsGrouped,
          domainPriceMarketValue,
          domainVolWeightedPriceDomains,
          domainTemperature,
          dataType
        } = dataProcess(responses, range, interval)

        perf.timeEnd(
          `------ ${region} — ${range}/${interval} (-- down to ${
            currentDatasetFlat.length
          })`
        )

        commit('isFetching', false)
        commit('isEnergyType', dataType === 'energy')
        commit('datasetFlat', datasetFlat)
        commit('currentDatasetFlat', currentDatasetFlat)
        commit('domainPowerEnergy', domainPowerEnergy)
        commit('domainPowerEnergyGrouped', domainPowerEnergyGrouped)
        commit('domainEmissions', domainEmissions)
        commit('domainEmissionsGrouped', domainEmissionsGrouped)
        commit('domainPriceMarketValue', domainPriceMarketValue)
        commit('domainVolWeightedPriceDomains', domainVolWeightedPriceDomains)
        commit('domainTemperature', domainTemperature)
        commit('currentDomainPowerEnergy', domainPowerEnergyGrouped[groupName])
        commit('jsonResponses', responses)
        commit('ready', true)
      })
    } else {
      throw new Error('Invalid region')
    }
  },

  doUpdateDatasetByInterval({ state, commit }, { range, interval }) {
    // Ignore if data is still being fetched.
    if (!state.isFetching) {
      const { currentDatasetFlat } = dataRollUp({
        datasetFlat: _cloneDeep(state.datasetFlat),
        domainPowerEnergy: state.domainPowerEnergy,
        domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
        domainEmissions: state.domainEmissions,
        domainEmissionsGrouped: state.domainEmissionsGrouped,
        domainPriceMarketValue: state.domainPriceMarketValue,
        domainTemperature: state.domainTemperature,
        range,
        interval
      })

      commit('currentDatasetFlat', currentDatasetFlat)
    }
  },

  doUpdateDatasetByGroup({ state, commit }, { groupName }) {
    commit(
      'currentDomainPowerEnergy',
      state.domainPowerEnergyGrouped[groupName]
    )
  },

  doFilterRegionData({ state, commit }, { range, interval }) {
    const { currentDatasetFlat } = dataRollUp({
      datasetFlat: _cloneDeep(state.datasetFlat),
      domainPowerEnergy: state.domainPowerEnergy,
      domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
      domainEmissions: state.domainEmissions,
      domainEmissionsGrouped: state.domainEmissionsGrouped,
      domainPriceMarketValue: state.domainPriceMarketValue,
      domainTemperature: state.domainTemperature,
      range,
      interval
    })

    commit('currentDatasetFlat', currentDatasetFlat)
  }
}
