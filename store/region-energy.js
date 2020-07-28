import _cloneDeep from 'lodash.clonedeep'
import http from '@/services/Http.js'
import Data from '@/services/Data.js'
import {
  flattenAndInterpolate,
  rollUp
} from '@/services/dataTransform/v2/Energy.js'
import PerfTime from '@/plugins/perfTime.js'
import { isValidRegion } from '@/constants/v2/energy-regions.js'
import * as FT from '@/constants/fuel-tech.js'

function doGetPowerEnergyDomains(ids, type) {
  return ids ? FT.getFuelTechObjs(ids, type).reverse() : []
}
function doGetTemperatureDomains(ids) {
  return ids.map(t => {
    return {
      id: t,
      domain: t,
      type: 'temperature',
      colour: 'red'
    }
  })
}

export const state = () => ({
  ready: false,
  isFetching: false,
  jsonResponses: null,
  fuelTechIdTypes: null,
  fuelTechDataType: null,
  temperatureIds: [],
  energyDataset: [],
  energyDatasetByInterval: [],
  temperatureDataset: []
})

export const getters = {
  ready: state => state.ready,
  isFetching: state => state.isFetching,
  energyDataset: state => state.energyDataset,
  energyDatasetByInterval: state => state.energyDatasetByInterval,
  temperatureDataset: state => state.temperatureDataset,
  powerEnergyDomains: state =>
    doGetPowerEnergyDomains(state.fuelTechIdTypes, state.fuelTechDataType),
  temperatureDomains: state => doGetTemperatureDomains(state.temperatureIds)
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
  fuelTechDataType(state, fuelTechDataType) {
    state.fuelTechDataType = fuelTechDataType
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
  fuelTechIdTypes(state, fuelTechIdTypes) {
    state.fuelTechIdTypes = _cloneDeep(fuelTechIdTypes)
  },
  temperatureIds(state, temperatureIds) {
    state.temperatureIds = _cloneDeep(temperatureIds)
  }
}

export const actions = {
  doGetRegionData({ commit }, { region, range, interval, group }) {
    if (isValidRegion(region)) {
      const urls = Data.getEnergyUrls(region, range, 'prod')

      commit('isFetching', true)

      http(urls).then(responses => {
        const perf = new PerfTime()
        perf.time()
        const data = responses[0]
        const {
          dataset,
          fuelTechDataType,
          temperatureDataset,
          fuelTechIdTypes,
          temperatureIds
        } = flattenAndInterpolate(data)

        const energyDatasetByInterval = rollUp({
          domains: [
            ...doGetPowerEnergyDomains(fuelTechIdTypes, fuelTechDataType),
            ...doGetTemperatureDomains(temperatureIds)
          ],
          dataset,
          interval
        })

        console.log(dataset, energyDatasetByInterval)

        commit('isFetching', false)
        commit('energyDataset', dataset)
        commit('energyDatasetByInterval', energyDatasetByInterval)
        commit('temperatureDataset', temperatureDataset)
        commit('fuelTechIdTypes', fuelTechIdTypes)
        commit('fuelTechDataType', fuelTechDataType)
        commit('temperatureIds', temperatureIds)
        commit('jsonResponses', responses)
        commit('ready', true)
        perf.timeEnd('Initial transform done.')
      })
    } else {
      throw new Error('Invalid region')
    }
  },

  doUpdateDatasetByInterval() {
    // with the interval, roll up
  },

  doUpdateDatasetByGroup() {
    // with the grouping, recalculate the data
  }
}
