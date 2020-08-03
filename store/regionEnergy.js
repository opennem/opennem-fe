import _cloneDeep from 'lodash.clonedeep'
import PerfTime from '@/plugins/perfTime.js'
import http from '@/services/Http.js'
import Data from '@/services/Data.js'
import { dataProcess, dataRollUp } from '@/modules/dataTransform/energy'
import { isValidRegion } from '@/constants/v2/energy-regions.js'

export const state = () => ({
  ready: false,
  isFetching: false,
  jsonResponses: null,
  datasetFlat: [],
  currentDatasetFlat: [],
  domainPowerEnergy: [],
  domainTemperature: [],
  domainPowerEnergyGrouped: [],
  currentDomainPowerEnergy: []
})

export const getters = {
  ready: state => state.ready,
  isFetching: state => state.isFetching,
  datasetFlat: state => state.datasetFlat,
  currentDatasetFlat: state => state.currentDatasetFlat,
  domainPowerEnergy: state => state.domainPowerEnergy,
  domainTemperature: state => state.domainTemperature,
  domainPowerEnergyGrouped: state => state.domainPowerEnergyGrouped,
  currentDomainPowerEnergy: state => state.currentDomainPowerEnergy
}

export const mutations = {
  ready(state, ready) {
    state.ready = ready
  },
  isFetching(state, isFetching) {
    state.isFetching = isFetching
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
  domainTemperature(state, domainTemperature) {
    state.domainTemperature = _cloneDeep(domainTemperature)
  },
  domainPowerEnergyGrouped(state, domainPowerEnergyGrouped) {
    state.domainPowerEnergyGrouped = _cloneDeep(domainPowerEnergyGrouped)
  },
  currentDomainPowerEnergy(state, currentDomainPowerEnergy) {
    state.currentDomainPowerEnergy = _cloneDeep(currentDomainPowerEnergy)
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
        const data = responses[0].data || responses[0]

        const {
          datasetFlat,
          domainPowerEnergy,
          domainTemperature,
          currentDatasetFlat,
          domainPowerEnergyGrouped
        } = dataProcess(data, interval)

        console.log(datasetFlat)

        commit('isFetching', false)
        commit('datasetFlat', datasetFlat)
        commit('currentDatasetFlat', currentDatasetFlat)
        commit('domainPowerEnergy', domainPowerEnergy)
        commit('domainTemperature', domainTemperature)
        commit('domainPowerEnergyGrouped', domainPowerEnergyGrouped)
        commit('currentDomainPowerEnergy', domainPowerEnergyGrouped[groupName])
        commit('jsonResponses', responses)
        commit('ready', true)
        perf.timeEnd('Initial transform done.')
      })
    } else {
      throw new Error('Invalid region')
    }
  },

  doUpdateDatasetByInterval({ state, commit }, { interval }) {
    const perf = new PerfTime()
    perf.time()

    const datasetFlat = _cloneDeep(state.datasetFlat)
    const domainPowerEnergy = state.domainPowerEnergy
    const domainTemperature = state.domainTemperature
    const domainPowerEnergyGrouped = state.domainPowerEnergyGrouped

    const { currentDatasetFlat } = dataRollUp(
      datasetFlat,
      [...domainPowerEnergy, ...domainTemperature],
      domainPowerEnergyGrouped,
      interval
    )

    commit('currentDatasetFlat', currentDatasetFlat)
    perf.timeEnd('Update interval done.')
  },

  doUpdateDatasetByGroup({ state, commit }, { groupName }) {
    const perf = new PerfTime()
    perf.time()

    const domainPowerEnergyGrouped = state.domainPowerEnergyGrouped

    commit('currentDomainPowerEnergy', domainPowerEnergyGrouped[groupName])
    perf.timeEnd('Update group done.')
  }
}
