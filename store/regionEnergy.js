import _cloneDeep from 'lodash.clonedeep'
import PerfTime from '@/plugins/perfTime.js'
import http from '@/services/Http.js'
import Data from '@/services/Data.js'
import {
  simpleDataProcess,
  dataProcess,
  dataRollUp,
  dataFilterByPeriod
} from '@/data/parse/region-energy'
import { isValidRegion } from '@/constants/energy-regions.js'

let currentRegion = ''

function getDataCount(responses) {
  let count = 0
  if (responses.length > 0) {
    responses.forEach((r) => {
      r.forEach((d) => {
        if (d.history && d.history.data) {
          count += d.history.data.length
        }
        if (d.forecast && d.forecast.data) {
          count += d.forecast.data.length
        }
      })
    })
  }
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
  changeSinceDataset: [],
  domainPowerEnergy: [],
  domainPowerEnergyGrouped: [],
  domainEmissions: [],
  domainEmissionsGrouped: [],
  domainMarketValue: [],
  domainMarketValueGrouped: [],
  domainPrice: [],
  domainTemperature: [],
  domainDemandPrice: [],
  domainDemandEnergy: [],
  domainDemandPower: [],
  domainDemandMarketValue: [],
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
  ready: (state) => state.ready,
  isFetching: (state) => state.isFetching,
  isEnergyType: (state) => state.isEnergyType,
  datasetFlat: (state) => state.datasetFlat,
  datasetFull: (state) => state.datasetFull,
  currentDataset: (state) => state.currentDataset,
  changeSinceDataset: (state) => state.changeSinceDataset,
  domainPowerEnergy: (state) => state.domainPowerEnergy,
  domainPowerEnergyGrouped: (state) => state.domainPowerEnergyGrouped,
  domainEmissions: (state) => state.domainEmissions,
  domainEmissionsGrouped: (state) => state.domainEmissionsGrouped,
  domainMarketValue: (state) => state.domainMarketValue,
  domainMarketValueGrouped: (state) => state.domainMarketValueGrouped,
  domainPrice: (state) => state.domainPrice,
  domainTemperature: (state) => state.domainTemperature,
  domainDemandPrice: (state) => state.domainDemandPrice,
  domainDemandEnergy: (state) => state.domainDemandEnergy,
  domainDemandPower: (state) => state.domainDemandPower,
  domainDemandMarketValue: (state) => state.domainDemandMarketValue,
  currentDomainPowerEnergy: (state) => state.currentDomainPowerEnergy,
  currentDomainEmissions: (state) => state.currentDomainEmissions,
  currentDomainMarketValue: (state) => state.currentDomainMarketValue,
  summary: (state) => state.summary,
  powerEnergyPrefix: (state) => state.powerEnergyPrefix,
  dataPowerEnergyInterval: (state) => state.dataPowerEnergyInterval,
  regionTimezoneString: (state) => state.regionTimezoneString,
  filteredDates: (state) => state.filteredDates,
  filteredCurrentDataset: (state) => {
    if (state.isEnergyType) {
      return state.filteredDates.length > 0
        ? state.currentDataset.filter(
            (d) =>
              d.time >= state.filteredDates[0].getTime() &&
              d.time < state.filteredDates[1].getTime()
          )
        : state.currentDataset
    } else {
      return state.filteredDates.length > 0
        ? state.currentDataset.filter(
            (d) =>
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
  changeSinceDataset(state, changeSinceDataset) {
    state.changeSinceDataset = _cloneDeep(changeSinceDataset)
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
    state.currentDomainPowerEnergy = currentDomainPowerEnergy
      ? _cloneDeep(currentDomainPowerEnergy)
      : []
  },
  currentDomainEmissions(state, currentDomainEmissions) {
    state.currentDomainEmissions = currentDomainEmissions
      ? _cloneDeep(currentDomainEmissions)
      : []
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
  },
  domainDemandPrice(state, domainDemandPrice) {
    state.domainDemandPrice = _cloneDeep(domainDemandPrice)
  },
  domainDemandEnergy(state, domainDemandEnergy) {
    state.domainDemandEnergy = _cloneDeep(domainDemandEnergy)
  },
  domainDemandPower(state, domainDemandPower) {
    state.domainDemandPower = _cloneDeep(domainDemandPower)
  },
  domainDemandMarketValue(state, domainDemandMarketValue) {
    state.domainDemandMarketValue = _cloneDeep(domainDemandMarketValue)
  }
}

export const actions = {
  doGetAllMonthlyData({ commit, dispatch, rootGetters }, { regions, range, interval, filterPeriod }) {
    dispatch('app/doClearError', null, { root: true })

    const displayTz = rootGetters.displayTimeZone
    const url = Data.getAllMonthlyPath()

    commit('ready', false)
    commit('isFetching', true)

    function processResponses(responses) {
      const dataCount = getDataCount(responses)
      const perf = new PerfTime()
      perf.time()
      console.info(`------ ${currentRegion} (start)`)

      const {
        datasetFull,
        datasetFlat,
        currentDataset: dataset,
        dataPowerEnergyInterval,
        domainPowerEnergy,
        domainPowerEnergyGrouped,
        domainEmissions,
        domainEmissionsGrouped,
        domainMarketValue,
        domainMarketValueGrouped,
        domainPrice,
        domainTemperature,
        domainDemandPrice,
        domainDemandEnergy,
        domainDemandPower,
        domainDemandMarketValue,
        dataType,
        units,
        inflation
      } = dataProcess(responses, range, interval, filterPeriod, displayTz)

      perf.timeEnd(
        `------ ${currentRegion} — (${dataCount} down to ${dataset.length})`
      )

      return {
        dataset,
        domainPowerEnergy,
        domainEmissions,
        domainTemperature,
        domainPrice,
        domainMarketValue,
        domainDemandPrice,
        domainDemandEnergy,
        domainDemandMarketValue,
        inflation
      }
    }

    return http([url])
      .then((res) => {
        const check = res.length > 0 ? (res[0].data ? true : false) : false
        const responses = check ? res[0].data : []
        const all = {}

        regions.forEach((r, i) => {
          console.log('region', r.id)
          const cpiData = responses.find((d) => d.type === 'cpi')
          const filtered = responses.filter(
            (d) => d.region && d.region.toLowerCase() === r.id
          )

          // WORKAROUND for demand series using code as region id
          const filtered2 = responses.filter(
            (d) => d.code && d.code.toLowerCase() === r.id
          )

          if (cpiData) {
            filtered.push(cpiData)
          }
          if (filtered2.length) {
            filtered2.forEach(d => filtered.push(d))
          }
          currentRegion = r.id
          all[r.id] = processResponses([filtered])
        })

        commit('isFetching', true)

        return all
      })
      .catch((e) => {
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
      })
  },

  doGetAllData({ commit, dispatch, rootGetters }, { regions }) {
    dispatch('app/doClearError', null, { root: true })

    const displayTz = rootGetters.displayTimeZone
    const url = Data.getAllMonthlyPath()

    commit('ready', false)
    commit('isFetching', true)

    function processResponses(responses) {
      const dataCount = getDataCount(responses)
      const perf = new PerfTime()
      perf.time()
      console.info(`------ ${currentRegion} (start)`)

      const {
        dataset,
        domainPowerEnergy,
        domainEmissions,
        domainTemperature,
        domainPrice,
        domainMarketValue,
        domainDemandPrice,
        domainDemandEnergy,
        domainDemandMarketValue,
        inflation
      } = simpleDataProcess(responses, displayTz)

      perf.timeEnd(
        `------ ${currentRegion} — (${dataCount} down to ${dataset.length})`
      )

      return {
        dataset,
        domainPowerEnergy,
        domainEmissions,
        domainTemperature,
        domainPrice,
        domainMarketValue,
        domainDemandPrice,
        domainDemandEnergy,
        domainDemandMarketValue,
        inflation
      }
    }

    return http([url])
      .then((res) => {
        const check = res.length > 0 ? (res[0].data ? true : false) : false
        const responses = check ? res[0].data : []
        const all = {}

        regions.forEach((r, i) => {
          const cpiData = responses.find((d) => d.type === 'cpi')
          const filtered = responses.filter(
            (d) => d.region && d.region.toLowerCase() === r.id
          )

          // WORKAROUND for demand series using code as region id
          const filtered2 = responses.filter(
            (d) => d.code && d.code.toLowerCase() === r.id
          )

          if (cpiData) {
            filtered.push(cpiData)
          }
          if (filtered2.length) {
            filtered2.forEach(d => filtered.push(d))
          }
          currentRegion = r.id
          all[r.id] = processResponses([filtered])
        })

        return all
      })
      .catch((e) => {
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
      })
  },

  doGetRegionData({ commit, dispatch, rootGetters }, { region }) {
    dispatch('app/doClearError', null, { root: true })

    if (isValidRegion(region)) {
      const displayTz = rootGetters.displayTimeZone
      const url = Data.getRegionAllDailyPath(region, true)

      currentRegion = region

      commit('ready', false)
      commit('isFetching', true)

      function processResponses(responses) {
        const dataCount = getDataCount(responses)
        const perf = new PerfTime()
        perf.time()
        console.info(`------ ${currentRegion} (start)`)

        const {
          dataset,
          domainPowerEnergy,
          domainEmissions,
          domainTemperature,
          domainPrice,
          domainMarketValue,
          domainDemandPrice,
          domainDemandEnergy,
          domainDemandMarketValue,
          inflation
        } = simpleDataProcess(responses, displayTz)

        perf.timeEnd(
          `------ ${currentRegion} — (${dataCount} down to ${dataset.length})`
        )

        return {
          dataset,
          domainPowerEnergy,
          domainEmissions,
          domainTemperature,
          domainPrice,
          domainMarketValue,
          domainDemandPrice,
          domainDemandEnergy,
          domainDemandMarketValue,
          inflation
        }
      }

      return http([url])
        .then((res) => {
          const check = res.length > 0 ? (res[0].data ? true : false) : false
          let responses = check
            ? res.map((d) => {
                return d.data
              })
            : res

          return processResponses(responses)
        })
        .catch((e) => {
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
        })
    }
  },

  doGetRegionDataByRangeInterval(
    { commit, dispatch, rootGetters },
    { region, range, interval, period, groupName }
  ) {
    dispatch('app/doClearError', null, { root: true })

    if (isValidRegion(region) && range !== '' && interval !== '') {
      const displayTz = rootGetters.displayTimeZone
      const urls = Data.getEnergyUrls(region, range)
      currentRegion = region
      commit('ready', false)
      commit('isFetching', true)

      function processResponses(responses) {
        const dataCount = getDataCount(responses)
        const perf = new PerfTime()
        perf.time()
        console.info(`------ ${currentRegion} — ${range}/${interval} (start)`)
        console.log('***', range, interval, period)
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
          domainDemandPrice,
          domainDemandEnergy,
          domainDemandPower,
          domainDemandMarketValue,
          dataType,
          units
        } = dataProcess(responses, range, interval, period, displayTz)

        perf.timeEnd(
          `------ ${currentRegion} — ${range}/${interval} (${dataCount} down to ${currentDataset.length})`
        )

        console.log('domainDemandMarketValue', domainDemandMarketValue)

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
        commit('domainDemandPrice', domainDemandPrice)
        commit('domainDemandEnergy', domainDemandEnergy)
        commit('domainDemandPower', domainDemandPower)
        commit('domainDemandMarketValue', domainDemandMarketValue)
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

        return {
          currentDataset,
          currentDomainPowerEnergy: domainPowerEnergyGrouped[groupName],
          currentDomainEmissions: domainEmissionsGrouped[groupName],
          domainTemperature,
          domainPrice
        }
      }

      return http(urls)
        .then((res) => {
          const check = res.length > 0 ? (res[0].data ? true : false) : false
          let responses = check
            ? res.map((d) => {
                return d.data
              })
            : res

          const version = res[0].version
          commit('app/apiVersion', version && version !== '' ? version : null, {
            root: true
          })

          return processResponses(responses)
        })
        .catch((e) => {
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

  doUpdateAllRegionDatasetByInterval({ state, commit }, { allDataset, regions, range, interval }) {
    const updated = {}

    function rollup(regionData) {
      const { currentDataset } = dataRollUp({
        isEnergyType: true,
        datasetFlat: _cloneDeep(regionData.dataset),
        domainPowerEnergy: regionData.domainPowerEnergy,
        domainPowerEnergyGrouped: [],
        domainEmissions: regionData.domainEmissions,
        domainEmissionsGrouped: [],
        domainMarketValue: regionData.domainMarketValue,
        domainMarketValueGrouped: [],
        domainPrice: regionData.domainPrice,
        domainTemperature: regionData.domainTemperature,
        domainDemandPrice: regionData.domainDemandPrice,
        domainDemandEnergy: regionData.domainDemandEnergy,
        domainDemandPower: [],
        domainDemandMarketValue: regionData.domainDemandMarketValue,
        range,
        interval
      })

      return {
        dataset: currentDataset,
        domainPowerEnergy: regionData.domainPowerEnergy,
        domainEmissions: regionData.domainEmissions,
        domainTemperature: regionData.domainTemperature,
        domainDemandPrice: regionData.domainDemandPrice,
        domainMarketValue: regionData.domainMarketValue,
        domainDemandPrice: regionData.domainDemandPrice,
        domainDemandEnergy: regionData.domainDemandEnergy,
        domainDemandMarketValue: regionData.domainDemandMarketValue,
        inflation: regionData.inflation
      }
    }

    regions.forEach((region) => {
      updated[region.id] = rollup(allDataset[region.id])
    })

    return updated
  },

  doUpdateDatasetByInterval({ state, commit }, { range, interval }) {
    // Ignore if data is still being fetched.
    if (!state.isFetching) {
      console.info(`------ ${currentRegion} — ${range}/${interval} (start)`)

      const { currentDataset } = dataRollUp({
        isEnergyType: state.isEnergyType,
        datasetFlat: _cloneDeep(state.datasetFlat),
        domainPowerEnergy: state.domainPowerEnergy,
        domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
        domainEmissions: state.domainEmissions,
        domainEmissionsGrouped: state.domainEmissionsGrouped,
        domainMarketValue: state.domainMarketValue,
        domainMarketValueGrouped: state.domainMarketValueGrouped,
        domainPrice: state.domainPrice,
        domainTemperature: state.domainTemperature,
        domainDemandPrice: state.domainDemandPrice,
        domainDemandEnergy: state.domainDemandEnergy,
        domainDemandPower: state.domainDemandPower,
        domainDemandMarketValue: state.domainDemandMarketValue,
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
      datasetFlat: _cloneDeep(state.datasetFlat),
      domainPowerEnergy: state.domainPowerEnergy,
      domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
      domainEmissions: state.domainEmissions,
      domainEmissionsGrouped: state.domainEmissionsGrouped,
      domainMarketValue: state.domainMarketValue,
      domainMarketValueGrouped: state.domainMarketValueGrouped,
      domainPrice: state.domainPrice,
      domainTemperature: state.domainTemperature,
      domainDemandPrice: state.domainDemandPrice,
      domainDemandEnergy: state.domainDemandEnergy,
      domainDemandPower: state.domainDemandPower,
      domainDemandMarketValue: state.domainDemandMarketValue,
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
      datasetFlat: _cloneDeep(state.datasetFlat),
      domainPowerEnergy: state.domainPowerEnergy,
      domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
      domainEmissions: state.domainEmissions,
      domainEmissionsGrouped: state.domainEmissionsGrouped,
      domainMarketValue: state.domainMarketValue,
      domainMarketValueGrouped: state.domainMarketValueGrouped,
      domainPrice: state.domainPrice,
      domainTemperature: state.domainTemperature,
      domainDemandPrice: state.domainDemandPrice,
      domainDemandEnergy: state.domainDemandEnergy,
      domainDemandPower: state.domainDemandPower,
      domainDemandMarketValue: state.domainDemandMarketValue,
      range,
      interval
    })
    commit('currentDataset', currentDataset)
  }
}
