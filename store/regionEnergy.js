import _cloneDeep from 'lodash.clonedeep'
import PerfTime from '@/plugins/perfTime.js'
import { lsGet, lsSet } from '@/services/LocalStorage'
import hostEnv from '@/services/HostEnv.js'
import http from '@/services/Http.js'
import Data from '@/services/Data.js'
import {
  dataProcess,
  dataRollUp,
  dataFilterByPeriod
} from '@/modules/dataTransform/energy'
import { isValidRegion } from '@/constants/energy-regions.js'

let currentRegion = ''

function getDataCount(responses) {
  let count = 0
  responses.forEach(r => {
    r.forEach(d => {
      if (d.history && d.history.data) {
        count += d.history.data.length
      }
      if (d.forecast && d.forecast.data) {
        count += d.forecast.data.length
      }
    })
  })
  return count
}

export const state = () => ({
  ready: false,
  isFetching: false,
  isEnergyType: false,
  jsonResponses: null,
  datasetFull: [],
  datasetFlat: [],
  currentDataset: [],
  domainPowerEnergy: [],
  domainPowerEnergyGrouped: [],
  domainEmissions: [],
  domainEmissionsGrouped: [],
  domainMarketValue: [],
  domainMarketValueGrouped: [],
  domainPrice: [],
  domainTemperature: [],
  currentDomainPowerEnergy: [],
  currentDomainEmissions: [],
  currentDomainMarketValue: [],
  filteredDates: [],
  summary: null,
  powerEnergyPrefix: '',
  dataPowerEnergyInterval: null,
  regionTimezoneString: null
})

export const getters = {
  ready: state => state.ready,
  isFetching: state => state.isFetching,
  isEnergyType: state => state.isEnergyType,
  datasetFlat: state => state.datasetFlat,
  currentDataset: state => state.currentDataset,
  domainPowerEnergy: state => state.domainPowerEnergy,
  domainPowerEnergyGrouped: state => state.domainPowerEnergyGrouped,
  domainEmissions: state => state.domainEmissions,
  domainEmissionsGrouped: state => state.domainEmissionsGrouped,
  domainMarketValue: state => state.domainMarketValue,
  domainMarketValueGrouped: state => state.domainMarketValueGrouped,
  domainPrice: state => state.domainPrice,
  domainTemperature: state => state.domainTemperature,
  currentDomainPowerEnergy: state => state.currentDomainPowerEnergy,
  currentDomainEmissions: state => state.currentDomainEmissions,
  currentDomainMarketValue: state => state.currentDomainMarketValue,
  summary: state => state.summary,
  powerEnergyPrefix: state => state.powerEnergyPrefix,
  dataPowerEnergyInterval: state => state.dataPowerEnergyInterval,
  regionTimezoneString: state => state.regionTimezoneString,
  filteredDates: state => state.filteredDates,
  filteredCurrentDataset: state => {
    if (state.isEnergyType) {
      return state.filteredDates.length > 0
        ? state.currentDataset.filter(
            d =>
              d.time >= state.filteredDates[0].getTime() &&
              d.time < state.filteredDates[1].getTime()
          )
        : state.currentDataset
    } else {
      return state.filteredDates.length > 0
        ? state.currentDataset.filter(
            d =>
              d.time >= state.filteredDates[0].getTime() &&
              d.time <= state.filteredDates[1].getTime()
          )
        : state.currentDataset
    }
  }
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
  datasetFull(state, datasetFull) {
    state.datasetFull = datasetFull
  },
  datasetFlat(state, datasetFlat) {
    state.datasetFlat = _cloneDeep(datasetFlat)
  },
  currentDataset(state, currentDataset) {
    state.currentDataset = _cloneDeep(currentDataset)
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
  domainMarketValue(state, domainMarketValue) {
    state.domainMarketValue = _cloneDeep(domainMarketValue)
  },
  domainMarketValueGrouped(state, domainMarketValueGrouped) {
    state.domainMarketValueGrouped = _cloneDeep(domainMarketValueGrouped)
  },
  domainPrice(state, domainPrice) {
    state.domainPrice = _cloneDeep(domainPrice)
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
  currentDomainMarketValue(state, currentDomainMarketValue) {
    state.currentDomainMarketValue = _cloneDeep(currentDomainMarketValue)
  },
  summary(state, summary) {
    state.summary = _cloneDeep(summary)
  },
  powerEnergyPrefix(state, powerEnergyPrefix) {
    state.powerEnergyPrefix = powerEnergyPrefix
  },
  dataPowerEnergyInterval(state, dataPowerEnergyInterval) {
    state.dataPowerEnergyInterval = dataPowerEnergyInterval
  },
  regionTimezoneString(state, regionTimezoneString) {
    state.regionTimezoneString = regionTimezoneString
  },
  filteredDates(state, filteredDates) {
    state.filteredDates = _cloneDeep(filteredDates)
  }
}

export const actions = {
  doGetRegionData(
    { commit, dispatch },
    { region, range, interval, period, groupName }
  ) {
    dispatch('app/doClearError', null, { root: true })

    if (isValidRegion(region) && range !== '' && interval !== '') {
      const env = hostEnv()
      const urls = Data.getEnergyUrls(region, range, env)
      currentRegion = region
      commit('ready', false)
      commit('isFetching', true)

      function processResponses(responses) {
        const dataCount = getDataCount(responses)
        const perf = new PerfTime()
        perf.time()
        console.info(`------ ${currentRegion} — ${range}/${interval} (start)`)
        console.log(responses)

        const {
          datasetFull,
          datasetFlat,
          currentDataset,
          dataPowerEnergyInterval,
          domainPowerEnergy,
          domainPowerEnergyGrouped,
          domainEmissions,
          domainEmissionsGrouped,
          domainMarketValue,
          domainMarketValueGrouped,
          domainPrice,
          domainTemperature,
          dataType,
          units
        } = dataProcess(responses, range, interval, period)

        perf.timeEnd(
          `------ ${currentRegion} — ${range}/${interval} (${dataCount} down to ${
            currentDataset.length
          })`
        )

        commit('isFetching', false)
        commit('isEnergyType', dataType === 'energy')

        commit('datasetFull', datasetFull)
        commit('datasetFlat', datasetFlat)
        commit('currentDataset', currentDataset)
        commit('dataPowerEnergyInterval', dataPowerEnergyInterval)

        commit('domainPowerEnergy', domainPowerEnergy)
        commit('domainPowerEnergyGrouped', domainPowerEnergyGrouped)
        commit('domainEmissions', domainEmissions)
        commit('domainEmissionsGrouped', domainEmissionsGrouped)
        commit('domainMarketValue', domainMarketValue)
        commit('domainMarketValueGrouped', domainMarketValueGrouped)
        commit('domainPrice', domainPrice)
        commit('domainTemperature', domainTemperature)
        commit('currentDomainPowerEnergy', domainPowerEnergyGrouped[groupName])
        commit('currentDomainEmissions', domainEmissionsGrouped[groupName])
        commit('currentDomainMarketValue', domainMarketValueGrouped[groupName])

        // parse units
        let prefix = ''
        const isWattsPerHour =
          units.toLowerCase().indexOf('wh') >= 0 ? true : false
        const isWatts = isWattsPerHour ? false : true

        if (isWattsPerHour) {
          if (units.length === 3) {
            prefix = units[0]
          }
        } else if (isWatts) {
          if (units.length === 2) {
            prefix = units[0]
          }
        }
        commit('powerEnergyPrefix', prefix)

        commit('jsonResponses', responses)
        commit('ready', true)
      }

      http(urls)
        .then(res => {
          const check = res.length > 0 ? (res[0].data ? true : false) : false
          let responses = check
            ? res.map(d => {
                return d.data
              })
            : res

          processResponses(responses)
        })
        .catch(e => {
          console.error('error', e)
          let header = 'Error'
          let message = ''

          if (!e) {
            message =
              'There is an issue processing the responses. Please check the developer console and contact OpenNEM.'
          } else {
            const error = e.toJSON()
            header = `${error.message}`
            message = `Trying to fetch <code>${error.config.url}</code>`

            console.log(error)
          }
          dispatch(
            'app/doUpdateError',
            {
              header,
              message
            },
            { root: true }
          )
        })
    } else {
      console.log('not processing data')
    }
  },

  doUpdateDatasetByInterval({ state, commit }, { range, interval }) {
    // Ignore if data is still being fetched.
    if (!state.isFetching) {
      // console.log('****** doUpdateDatasetByInterval')
      console.info(`------ ${currentRegion} — ${range}/${interval} (start)`)
      const { currentDataset } = dataRollUp({
        isEnergyType: state.isEnergyType,
        datasetFlat: _cloneDeep(state.datasetFull),
        domainPowerEnergy: state.domainPowerEnergy,
        domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
        domainEmissions: state.domainEmissions,
        domainEmissionsGrouped: state.domainEmissionsGrouped,
        domainMarketValue: state.domainMarketValue,
        domainMarketValueGrouped: state.domainMarketValueGrouped,
        domainPrice: state.domainPrice,
        domainTemperature: state.domainTemperature,
        range,
        interval
      })
      console.info(`------ ${currentRegion} — ${range}/${interval} (end)`)
      commit('currentDataset', currentDataset)
    }
  },

  doUpdateDatasetByGroup({ state, commit }, { groupName }) {
    commit(
      'currentDomainPowerEnergy',
      state.domainPowerEnergyGrouped[groupName]
    )
    commit('currentDomainEmissions', state.domainEmissionsGrouped[groupName])
    commit(
      'currentDomainMarketValue',
      state.domainMarketValueGrouped[groupName]
    )
  },

  doUpdateDatasetByFilterPeriod(
    { state, commit },
    { range, interval, period }
  ) {
    // console.log('****** doUpdateDatasetByFilterPeriod')
    const { currentDataset } = dataRollUp({
      isEnergyType: state.isEnergyType,
      datasetFlat: _cloneDeep(state.datasetFull),
      domainPowerEnergy: state.domainPowerEnergy,
      domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
      domainEmissions: state.domainEmissions,
      domainEmissionsGrouped: state.domainEmissionsGrouped,
      domainMarketValue: state.domainMarketValue,
      domainMarketValueGrouped: state.domainMarketValueGrouped,
      domainPrice: state.domainPrice,
      domainTemperature: state.domainTemperature,
      range,
      interval
    })
    const { filteredDatasetFlat } = dataFilterByPeriod({
      currentDataset,
      interval,
      period
    })
    commit('currentDataset', filteredDatasetFlat)
  },

  doUpdateDatasetByFilterRange({ state, commit }, { range, interval }) {
    const { currentDataset } = dataRollUp({
      isEnergyType: state.isEnergyType,
      datasetFlat: _cloneDeep(state.datasetFull),
      domainPowerEnergy: state.domainPowerEnergy,
      domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
      domainEmissions: state.domainEmissions,
      domainEmissionsGrouped: state.domainEmissionsGrouped,
      domainMarketValue: state.domainMarketValue,
      domainMarketValueGrouped: state.domainMarketValueGrouped,
      domainPrice: state.domainPrice,
      domainTemperature: state.domainTemperature,
      range,
      interval
    })
    commit('currentDataset', currentDataset)
  }
}
