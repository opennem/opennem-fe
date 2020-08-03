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
  energyDataset: [],
  energyDatasetByInterval: [],
  temperatureDataset: [],
  powerEnergyDomains: [],
  temperatureDomains: [],
  domainPowerEnergyGrouped: [],
  currentPowerEnergyDomains: []
})

export const getters = {
  ready: state => state.ready,
  isFetching: state => state.isFetching,
  energyDataset: state => state.energyDataset,
  energyDatasetByInterval: state => state.energyDatasetByInterval,
  temperatureDataset: state => state.temperatureDataset,
  powerEnergyDomains: state => state.powerEnergyDomains,
  temperatureDomains: state => state.temperatureDomains,
  domainPowerEnergyGrouped: state => state.domainPowerEnergyGrouped,
  currentPowerEnergyDomains: state => state.currentPowerEnergyDomains
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
  energyDataset(state, energyDataset) {
    state.energyDataset = _cloneDeep(energyDataset)
  },
  energyDatasetByInterval(state, energyDatasetByInterval) {
    state.energyDatasetByInterval = _cloneDeep(energyDatasetByInterval)
  },
  temperatureDataset(state, temperatureDataset) {
    state.temperatureDataset = _cloneDeep(temperatureDataset)
  },
  powerEnergyDomains(state, powerEnergyDomains) {
    state.powerEnergyDomains = _cloneDeep(powerEnergyDomains)
  },
  temperatureDomains(state, temperatureDomains) {
    state.temperatureDomains = _cloneDeep(temperatureDomains)
  },
  domainPowerEnergyGrouped(state, domainPowerEnergyGrouped) {
    state.domainPowerEnergyGrouped = _cloneDeep(domainPowerEnergyGrouped)
  },
  currentPowerEnergyDomains(state, currentPowerEnergyDomains) {
    state.currentPowerEnergyDomains = _cloneDeep(currentPowerEnergyDomains)
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
          datasetAll,
          datasetTemperature,
          powerEnergyDomains,
          temperatureDomains,
          energyDatasetByInterval,

          domainPowerEnergyGrouped
        } = dataProcess(data, interval, groupName)

        console.log(datasetAll)

        commit('isFetching', false)
        commit('energyDataset', datasetAll)
        commit('energyDatasetByInterval', energyDatasetByInterval)
        commit('temperatureDataset', datasetTemperature)
        commit('powerEnergyDomains', powerEnergyDomains)
        commit('temperatureDomains', temperatureDomains)
        commit('domainPowerEnergyGrouped', domainPowerEnergyGrouped)
        commit('currentPowerEnergyDomains', domainPowerEnergyGrouped[groupName])
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

    const datasetAll = _cloneDeep(state.energyDataset)
    const powerEnergyDomains = state.powerEnergyDomains
    const temperatureDomains = state.temperatureDomains
    const domainPowerEnergyGrouped = state.domainPowerEnergyGrouped

    const { energyDatasetByInterval } = dataRollUp(
      datasetAll,
      [...powerEnergyDomains, ...temperatureDomains],
      domainPowerEnergyGrouped,
      interval
    )

    commit('energyDatasetByInterval', energyDatasetByInterval)
    perf.timeEnd('Update interval done.')
  },

  doUpdateDatasetByGroup({ state, commit }, { groupName }) {
    const perf = new PerfTime()
    perf.time()

    const domainPowerEnergyGrouped = state.domainPowerEnergyGrouped

    commit('currentPowerEnergyDomains', domainPowerEnergyGrouped[groupName])
    perf.timeEnd('Update group done.')
  }
}
