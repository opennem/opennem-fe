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
  domainPriceMarketValue: [],
  domainTemperature: [],
  domainPowerEnergyGrouped: [],
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
  domainPriceMarketValue: state => state.domainPriceMarketValue,
  domainTemperature: state => state.domainTemperature,
  domainPowerEnergyGrouped: state => state.domainPowerEnergyGrouped,
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
  domainPriceMarketValue(state, domainPriceMarketValue) {
    state.domainPriceMarketValue = _cloneDeep(domainPriceMarketValue)
  },
  domainTemperature(state, domainTemperature) {
    state.domainTemperature = _cloneDeep(domainTemperature)
  },
  domainPowerEnergyGrouped(state, domainPowerEnergyGrouped) {
    state.domainPowerEnergyGrouped = _cloneDeep(domainPowerEnergyGrouped)
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
          domainPriceMarketValue,
          domainTemperature,
          domainPowerEnergyGrouped,
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
        commit('domainPriceMarketValue', domainPriceMarketValue)
        commit('domainTemperature', domainTemperature)
        commit('domainPowerEnergyGrouped', domainPowerEnergyGrouped)
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
      const datasetFlat = _cloneDeep(state.datasetFlat)
      const domainPowerEnergy = state.domainPowerEnergy
      const domainPriceMarketValue = state.domainPriceMarketValue
      const domainTemperature = state.domainTemperature
      const domainPowerEnergyGrouped = state.domainPowerEnergyGrouped

      const { currentDatasetFlat } = dataRollUp(
        datasetFlat,
        [...domainPowerEnergy, ...domainPriceMarketValue, ...domainTemperature],
        domainPowerEnergyGrouped,
        range,
        interval
      )

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
    const datasetFlat = _cloneDeep(state.datasetFlat)
    const domainPowerEnergy = state.domainPowerEnergy
    const domainTemperature = state.domainTemperature
    const domainPowerEnergyGrouped = state.domainPowerEnergyGrouped

    const { currentDatasetFlat } = dataRollUp(
      datasetFlat,
      [...domainPowerEnergy, ...domainTemperature],
      domainPowerEnergyGrouped,
      range,
      interval
    )

    commit('currentDatasetFlat', currentDatasetFlat)
  }
}
