import _cloneDeep from 'lodash.clonedeep'
import PerfTime from '@/plugins/perfTime.js'
import http from '@/services/Http.js'
import Data from '@/services/Data.js'
import {
  dataProcess,
  dataRollUp,
  dataFilterByPeriod
} from '@/modules/dataTransform/energy'
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
  domainPriceMarketValueGrouped: [],
  domainVolWeightedPriceDomains: [],
  domainTemperature: [],
  currentDomainPowerEnergy: [],
  currentDomainEmissions: [],
  currentDomainPriceMarketValue: [],
  filteredDates: [],
  summaryDataset: [],
  summary: null
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
  domainPriceMarketValueGrouped: state => state.domainPriceMarketValueGrouped,
  domainVolWeightedPriceDomains: state => state.domainVolWeightedPriceDomains,
  domainTemperature: state => state.domainTemperature,
  currentDomainPowerEnergy: state => state.currentDomainPowerEnergy,
  currentDomainEmissions: state => state.currentDomainEmissions,
  currentDomainPriceMarketValue: state => state.currentDomainPriceMarketValue,
  summaryDataset: state => state.summaryDataset,
  summary: state => state.summary,
  filteredCurrentDatasetFlat: state =>
    state.filteredDates.length > 0
      ? state.currentDatasetFlat.filter(
          d =>
            d.time >= state.filteredDates[0].getTime() &&
            d.date <= state.filteredDates[1].getTime()
        )
      : state.currentDatasetFlat
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
  domainPriceMarketValueGrouped(state, domainPriceMarketValueGrouped) {
    state.domainPriceMarketValueGrouped = _cloneDeep(
      domainPriceMarketValueGrouped
    )
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
  currentDomainEmissions(state, currentDomainEmissions) {
    state.currentDomainEmissions = _cloneDeep(currentDomainEmissions)
  },
  currentDomainPriceMarketValue(state, currentDomainPriceMarketValue) {
    state.currentDomainPriceMarketValue = _cloneDeep(
      currentDomainPriceMarketValue
    )
  },
  summaryDataset(state, summaryDataset) {
    state.summaryDataset = _cloneDeep(summaryDataset)
  },
  summary(state, summary) {
    state.summary = _cloneDeep(summary)
  },
  filteredDates(state, filteredDates) {
    state.filteredDates = _cloneDeep(filteredDates)
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
          domainPriceMarketValueGrouped,
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
        commit('domainPriceMarketValueGrouped', domainPriceMarketValueGrouped)
        commit('domainVolWeightedPriceDomains', domainVolWeightedPriceDomains)
        commit('domainTemperature', domainTemperature)
        commit('currentDomainPowerEnergy', domainPowerEnergyGrouped[groupName])
        commit('currentDomainEmissions', domainEmissionsGrouped[groupName])
        commit(
          'currentDomainPriceMarketValue',
          domainPriceMarketValueGrouped[groupName]
        )
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
        isEnergyType: state.isEnergyType,
        datasetFlat: _cloneDeep(state.datasetFlat),
        domainPowerEnergy: state.domainPowerEnergy,
        domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
        domainEmissions: state.domainEmissions,
        domainEmissionsGrouped: state.domainEmissionsGrouped,
        domainPriceMarketValue: state.domainPriceMarketValue,
        domainPriceMarketValueGrouped: state.domainPriceMarketValueGrouped,
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
    commit('currentDomainEmissions', state.domainEmissionsGrouped[groupName])
    commit(
      'currentDomainPriceMarketValue',
      state.domainPriceMarketValueGrouped[groupName]
    )
  },

  doFilterRegionData({ state, commit }, { range, interval }) {
    const { currentDatasetFlat } = dataRollUp({
      isEnergyType: state.isEnergyType,
      datasetFlat: _cloneDeep(state.datasetFlat),
      domainPowerEnergy: state.domainPowerEnergy,
      domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
      domainEmissions: state.domainEmissions,
      domainEmissionsGrouped: state.domainEmissionsGrouped,
      domainPriceMarketValue: state.domainPriceMarketValue,
      domainPriceMarketValueGrouped: state.domainPriceMarketValueGrouped,
      domainTemperature: state.domainTemperature,
      range,
      interval
    })

    commit('currentDatasetFlat', currentDatasetFlat)
  },

  doUpdateDatasetByFilterPeriod(
    { state, commit },
    { range, interval, period }
  ) {
    const { currentDatasetFlat } = dataRollUp({
      isEnergyType: state.isEnergyType,
      datasetFlat: _cloneDeep(state.datasetFlat),
      domainPowerEnergy: state.domainPowerEnergy,
      domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
      domainEmissions: state.domainEmissions,
      domainEmissionsGrouped: state.domainEmissionsGrouped,
      domainPriceMarketValue: state.domainPriceMarketValue,
      domainPriceMarketValueGrouped: state.domainPriceMarketValueGrouped,
      domainTemperature: state.domainTemperature,
      range,
      interval
    })
    const { filteredDatasetFlat } = dataFilterByPeriod({
      currentDatasetFlat,
      interval,
      period
    })
    commit('currentDatasetFlat', filteredDatasetFlat)
  }
}
