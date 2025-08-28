import _cloneDeep from 'lodash.clonedeep'
import subDays from 'date-fns/subDays'

import PerfTime from '@/plugins/perfTime.js'
import http from '@/services/Http.js'
import Data from '@/services/Data.js'
import {
  simpleDataProcess,
  dataProcess,
  dataRollUp,
  dataFilterByPeriod
} from '@/data/parse/region-energy'
import { dataRollUp as dataRollUpCapacity } from '@/data/parse/region-capacity'
import { dataProcess as dataProcessCapacity } from '@/data/parse/region-capacity'
import { isValidRegion } from '@/constants/energy-regions.js'
import { DEFAULT_FUEL_TECH_ORDER as capacityFuelTechOrder } from '@/constants/capacity-fuel-techs/group-detailed.js'

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
  useCachedData: false,
  isFetching: false,
  isEnergyType: false,
  jsonResponses: null,
  datasetFlat: [],
  currentDataset: [],
  _rolledUpDataset: [],
  changeSinceDataset: [],
  capacityData: [],
  capacityDataFlat: [],
  domainCapacity: [],
  domainCapacityGrouped: [],
  domainUnits: '',
  domainPowerEnergy: [],
  domainPowerEnergyGrouped: [],
  domainCurtailment: [],
  domainCurtailmentGrouped: [],
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
  currentDomainCapacity: [],
  currentDomainMarketValue: [],
  currentDomainCurtailment: [],
  filteredDates: [],
  summary: null,
  powerEnergyPrefix: '',
  dataPowerEnergyInterval: null,
  regionTimezoneString: null,
  compareResponse: null,
  allowResize: true
})

export const getters = {
  ready: (state) => state.ready,
  useCachedData: (state) => state.useCachedData,
  isFetching: (state) => state.isFetching,
  isEnergyType: (state) => state.isEnergyType,
  datasetFlat: (state) => state.datasetFlat,
  currentDataset: (state) => state.currentDataset,
  _rolledUpDataset: (state) => state._rolledUpDataset,
  changeSinceDataset: (state) => state.changeSinceDataset,
  domainPowerEnergy: (state) => state.domainPowerEnergy,
  domainPowerEnergyGrouped: (state) => state.domainPowerEnergyGrouped,
  domainCurtailment: (state) => state.domainCurtailment,
  domainCurtailmentGrouped: (state) => state.domainCurtailmentGrouped,
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
  currentDomainCapacity: (state) => state.currentDomainCapacity,
  currentDomainCurtailment: (state) => state.currentDomainCurtailment,
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
  },

  filteredCurrentDatasetCapacity: (state) => {
    return state.filteredDates.length > 0
        ? state.capacityData.filter(
            (d) =>
              d.time >= state.filteredDates[0].getTime() &&
              d.time <= state.filteredDates[1].getTime()
          )
        : state.capacityData
  },

  compareResponse: (state) => state.compareResponse,
  allowResize: (state) => state.allowResize,
  capacityData: (state) => state.capacityData,
  capacityDataFlat: (state) => state.capacityDataFlat,
  domainCapacity: (state) => state.domainCapacity,
  domainCapacityGrouped: (state) => state.domainCapacityGrouped,
  domainUnits: (state) => state.domainUnits
}

export const mutations = {
  ready(state, ready) {
    state.ready = ready
  },
  useCachedData(state, useCachedData) {
    state.useCachedData = useCachedData
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
  
  currentDataset(state, currentDataset) {
    state.currentDataset = _cloneDeep(currentDataset)
  },
  _rolledUpDataset(state, _rolledUpDataset) {
    state._rolledUpDataset = _cloneDeep(_rolledUpDataset)
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
  domainCurtailment(state, domainCurtailment) {
    state.domainCurtailment = _cloneDeep(domainCurtailment)
  },
  domainCurtailmentGrouped(state, domainCurtailmentGrouped) {
    state.domainCurtailmentGrouped = _cloneDeep(domainCurtailmentGrouped)
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
  currentDomainCapacity(state, currentDomainCapacity) {
    state.currentDomainCapacity = _cloneDeep(currentDomainCapacity)
  },
  currentDomainCurtailment(state, currentDomainCurtailment) {
    state.currentDomainCurtailment = _cloneDeep(currentDomainCurtailment)
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
  },
  compareResponse(state, compareResponse) {
    state.compareResponse = _cloneDeep(compareResponse)
  },
  allowResize(state, allowResize) {
    state.allowResize = allowResize
  },
  capacityData(state, capacityData) {
    state.capacityData = _cloneDeep(capacityData)
  },
  capacityDataFlat(state, capacityDataFlat) {
    state.capacityDataFlat = _cloneDeep(capacityDataFlat)
  },
  domainCapacity(state, domainCapacity) {
    state.domainCapacity = _cloneDeep(domainCapacity)
  },
  domainCapacityGrouped(state, domainCapacityGrouped) {
    state.domainCapacityGrouped = _cloneDeep(domainCapacityGrouped)
  },
  domainUnits(state, domainUnits) {
    state.domainUnits = domainUnits
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
        datasetFlat,
        currentDataset: dataset,
        dataPowerEnergyInterval,
        domainPowerEnergy,
        domainPowerEnergyGrouped,
        domainCurtailment,
        domainCurtailmentGrouped,
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
        domainCurtailment,
        domainCurtailmentGrouped,
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
        const raw = {}

        regions.forEach((r, i) => {
          const cpiData = responses.find((d) => d.type === 'cpi')
          const filtered = responses.filter(
            (d) => d.region && d.region.toLowerCase() === r.id
          )

          if (cpiData) {
            filtered.push(cpiData)
          }

          raw[r.id] = [...filtered]
        })

        regions.forEach((r, i) => {
          currentRegion = r.id
          all[r.id] = processResponses([raw[r.id]])
        })

        commit('isFetching', true)
        commit('compareResponse', raw)

        return all
      })
      .catch((e) => {
        console.error('error', e)
        let header = 'Error'
        let message = ''

        if (!e) {
          message =
            'There is an issue processing the responses. Please check the developer console and contact Open Electricity.'
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
            'There is an issue processing the responses. Please check the developer console and contact Open Electricity.'
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
              'There is an issue processing the responses. Please check the developer console and contact Open Electricity.'
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
    { region, range, interval, period, groupName, dashboardView = 'discrete-time' }
  ) {

    dispatch('app/doClearError', null, { root: true })

    const isDiscreteTime = dashboardView === 'discrete-time'

    if (isValidRegion(region) && range !== '' && interval !== '') {
      const displayTz = rootGetters.displayTimeZone
      const urls = isDiscreteTime ? Data.getEnergyUrls(region, range, interval) : Data.getTimeOfDayUrls(region, range)
      currentRegion = region
      commit('ready', false)
      commit('isFetching', true)

      function processResponses(responses) {
        const dataCount = getDataCount(responses)
        const perf = new PerfTime()
        perf.time()
        console.info(`------ ${currentRegion} — ${range}/${interval} (start)`)

        const {
          datasetFlat,
          datasetFull,
          currentDataset,
          dataPowerEnergyInterval,
          domainPowerEnergy,
          domainPowerEnergyGrouped,
          domainCurtailment,
          domainCurtailmentGrouped,
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

        if (isDiscreteTime) {
          commit('currentDataset', currentDataset)
        } else {
          const rangeVal = parseInt(range)
          const lastDate = currentDataset[currentDataset.length - 1].date
          const until = subDays(lastDate, rangeVal)
          until.setUTCHours(0, 0, 0, 0)

          const filteredCurrentDataset = currentDataset.filter(
            (d) => d.time >= until.getTime()
          )
          commit('currentDataset', filteredCurrentDataset)
        }

        commit('datasetFlat', datasetFlat)

        commit('isFetching', false)
        commit('isEnergyType', dataType === 'energy')

        commit('dataPowerEnergyInterval', dataPowerEnergyInterval)
        commit('domainPowerEnergy', domainPowerEnergy)
        commit('domainPowerEnergyGrouped', domainPowerEnergyGrouped)
        commit('domainCurtailment', domainCurtailment)
        commit('domainCurtailmentGrouped', domainCurtailmentGrouped)
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
        commit('currentDomainCurtailment', domainCurtailmentGrouped[groupName])
        commit('currentDomainEmissions', domainEmissionsGrouped[groupName])
        commit('currentDomainMarketValue', domainMarketValueGrouped[groupName])

        perf.timeEnd(
          `------ ${currentRegion} — ${range}/${interval} (${dataCount} down to ${currentDataset.length})`
        )

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
          currentDomainCurtailment: domainCurtailmentGrouped[groupName],
          domainTemperature,
          domainPrice
        }
      }

      return http(urls)
        .then(async (res) => {
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
              'There is an issue processing the responses. Please check the developer console and contact Open Electricity.'
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

  async doGetRegionCapacityDataByRangeInterval(
    { commit, dispatch, rootGetters, state },
    { region, range, interval, period, groupName }
  ) {

    function combineData(regionId, data) {
      let newData = []

      capacityFuelTechOrder.forEach(fuelTech => {
        const fuelTechData = data.filter(d => d.fueltech === fuelTech)
        if (fuelTechData.length > 0) {
          const firstData = fuelTechData[0]
          const newObj = {
            ...firstData,
            region: regionId,
            id: `capacity.${regionId}.${fuelTech}`,
            data: firstData.data.map(() => 0)
          }

          fuelTechData.forEach((d) => {
            d.data.forEach((d2, i) => {
              newObj.data[i] += d2
            })
          })

          newData.push(newObj)
        }
      })
      return newData
    }

    dispatch('app/doClearError', null, { root: true })

    if (isValidRegion(region) && range !== '' && interval !== '' && !state.isFetching) {
      const displayTz = rootGetters.displayTimeZone
      currentRegion = region
      commit('ready', false)
      commit('isFetching', true)

      // https://data.oedev.org/v4/stats/capacity_history.json
      // const res = await fetch(`https://data.oedev.org/v4/stats/capacity_history.json`)
      // const data = await res.json()
      const res = await http([`v4/stats/capacity_history.json`])
      const data = res[0]
      let capacityData = []

      
      function processCapacityResponses(responses) {
        if (!responses) {
          commit('capacityData', [])
          commit('capacityDataFlat', [])
          commit('domainCapacity', [])
          commit('domainCapacityGrouped', [])
          commit('domainUnits', '')
          commit('currentDomainCapacity', [])
          return
        }

        const { dataset, domainCapacity, domainCapacityGrouped, units } = 
          dataProcessCapacity(responses, range, interval, period, displayTz)

        commit('capacityData', dataset)
        commit('capacityDataFlat', dataset)
        commit('domainCapacity', domainCapacity)
        commit('domainCapacityGrouped', domainCapacityGrouped)
        commit('domainUnits', units)
        commit('currentDomainCapacity', domainCapacityGrouped[groupName])
      }

      if (range === 'ALL') {
        switch(region) {
          case 'nem':
            const nemRegions = ['NSW1', 'QLD1', 'SA1', 'TAS1', 'VIC1']
            const nemData = data.data.filter(d => nemRegions.includes(d.region)).filter(d => d.fueltech !== 'battery_charging')
            capacityData = combineData('nem', nemData)

            break
          case 'nsw1':
            capacityData = data.data.filter(d => d.region === 'NSW1').filter(d => d.fueltech !== 'battery_charging')
            break
          case 'qld1':
            capacityData = data.data.filter(d => d.region === 'QLD1').filter(d => d.fueltech !== 'battery_charging')
            break
          case 'vic1':
            capacityData = data.data.filter(d => d.region === 'VIC1').filter(d => d.fueltech !== 'battery_charging')
            break
          case 'sa1':
            capacityData = data.data.filter(d => d.region === 'SA1').filter(d => d.fueltech !== 'battery_charging')
            break
          case 'tas1':
            capacityData = data.data.filter(d => d.region === 'TAS1').filter(d => d.fueltech !== 'battery_charging')
            break
          case 'wem':
            capacityData = data.data.filter(d => d.region === 'WEM').filter(d => d.fueltech !== 'battery_charging')
            break
          default:
            const allRegions = ['NSW1', 'QLD1', 'SA1', 'TAS1', 'VIC1', 'WEM']
            const allRegionsData = data.data.filter(d => allRegions.includes(d.region)).filter(d => d.fueltech !== 'battery_charging')
            capacityData = combineData('all', allRegionsData)
        }
        commit('ready', true)
        commit('isFetching', false)
        return processCapacityResponses(capacityData)
      } else {
        commit('isFetching', false)
        return processCapacityResponses(null)
      }
      

    } else {
      console.log('not processing data')
    }
  },

  doUpdateCapacityDatasetByInterval({ state, commit }, { range, interval }) {
    // Ignore if data is still being fetched.
    if (!state.isFetching) {
      // commit('currentDomainCapacity', state.domainCapacityGrouped[groupName])

      if (range === 'ALL') {
        const currentDataset = dataRollUpCapacity({
          datasetFlat: state.capacityDataFlat,
          domainCapacity: state.domainCapacity,
          domainCapacityGrouped: state.domainCapacityGrouped,
          units: state.domainUnits
        })

        commit('capacityData', currentDataset)
      }
    }
  },

  doUpdateAllRegionDatasetByInterval({ state, commit, rootGetters }, { regions, range, interval, filterPeriod }) {
    const updated = {}
    const displayTz = rootGetters.displayTimeZone

    function processResponses(responses) {
      const dataCount = getDataCount(responses)
      const perf = new PerfTime()
      perf.time()
      console.info(`------ ${currentRegion} (start)`)

      const {
        datasetFlat,
        currentDataset: dataset,
        dataPowerEnergyInterval,
        domainPowerEnergy,
        domainPowerEnergyGrouped,
        domainCurtailment,
        domainCurtailmentGrouped,
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
        domainCurtailment,
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

    const raw = state.compareResponse
    regions.forEach((region) => {
      currentRegion = region.id
      updated[region.id] = processResponses([raw[region.id]])
    })

    return updated
  },

  doUpdateDatasetByInterval({ state, commit }, { range, interval }) {
    console.log('doUpdateDatasetByInterval', range, interval)
    // Ignore if data is still being fetched.
    if (!state.isFetching) {

      let filtered = state.datasetFlat

      if (!state.isEnergyType)  {
        const rangeVal = parseInt(range)
        const lastDate = state.datasetFlat[state.datasetFlat.length - 1].date
        const until = subDays(lastDate, rangeVal)
        until.setUTCHours(0, 0, 0, 0)

        filtered = state.datasetFlat.filter(
          (d) => d.time >= until.getTime()
        )
      }
      
      console.info(`------ ${currentRegion} — ${range}/${interval} (start)`)

      const { currentDataset } = dataRollUp({
        isEnergyType: state.isEnergyType,
        datasetFlat: _cloneDeep(filtered),
        domainPowerEnergy: state.domainPowerEnergy,
        domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
        domainCurtailment: state.domainCurtailment,
        domainCurtailmentGrouped: state.domainCurtailmentGrouped,
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

  doFilterDatasetByRange({ state, commit }, { range, interval }) {
    let filtered = state.datasetFlat

    if (!state.isEnergyType)  {
      const rangeVal = parseInt(range)
      const lastDate = state.datasetFlat[state.datasetFlat.length - 1].date
      const until = subDays(lastDate, rangeVal)
      until.setUTCHours(0, 0, 0, 0)

      filtered = state.datasetFlat.filter(
        (d) => d.time >= until.getTime()
      )
    }

    console.info(`------ ${currentRegion} — ${range}/${interval} (start)`)

    const { currentDataset } = dataRollUp({
      isEnergyType: state.isEnergyType,
      datasetFlat: _cloneDeep(filtered),
      domainPowerEnergy: state.domainPowerEnergy,
      domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
      domainCurtailment: state.domainCurtailment,
      domainCurtailmentGrouped: state.domainCurtailmentGrouped,
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
  },

  doUpdateCapacityDatasetByGroup({ state, commit }, { groupName }) {
    commit('currentDomainCapacity', state.domainCapacityGrouped[groupName])
  },

  doUpdateDatasetByGroup({ state, commit }, { groupName }) {
    commit(
      'currentDomainPowerEnergy',
      state.domainPowerEnergyGrouped[groupName]
    )
    commit('currentDomainCurtailment', state.domainCurtailmentGrouped[groupName])
    commit('currentDomainEmissions', state.domainEmissionsGrouped[groupName])
    commit(
      'currentDomainMarketValue',
      state.domainMarketValueGrouped[groupName]
    )
  },

  doUpdateCapacityDatasetByFilterPeriod(
    { state, commit },
    { range, interval, period }
  ) {
    
    const currentDataset = dataRollUpCapacity({
      datasetFlat: state.capacityDataFlat,
      domainCapacity: state.domainCapacity,
      domainCapacityGrouped: state.domainCapacityGrouped,
      units: state.domainUnits
    })

    const { filteredDatasetFlat } = dataFilterByPeriod({
      currentDataset,
      interval,
      period
    })

    commit('capacityData', filteredDatasetFlat)
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
      domainCurtailment: state.domainCurtailment,
      domainCurtailmentGrouped: state.domainCurtailmentGrouped,
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
    commit('_rolledUpDataset', currentDataset)
    commit('currentDataset', filteredDatasetFlat)
  },

  doUpdateDatasetByFilterRange({ state, commit }, { range, interval }) {
    const { currentDataset } = dataRollUp({
      isEnergyType: state.isEnergyType,
      datasetFlat: _cloneDeep(state.datasetFlat),
      domainPowerEnergy: state.domainPowerEnergy,
      domainPowerEnergyGrouped: state.domainPowerEnergyGrouped,
      domainCurtailment: state.domainCurtailment,
      domainCurtailmentGrouped: state.domainCurtailmentGrouped,
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
