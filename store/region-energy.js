import http from '@/services/Http.js'
import Data from '@/services/Data.js'
import {
  checkPowerEnergyExists,
  getStartEndNum,
  incrementTime
} from '@/services/DataCheck.js'
import PerfTime from '@/plugins/perfTime.js'
import {
  getEnergyRegions,
  isValidRegion
} from '@/constants/v2/energy-regions.js'
import * as FT from '@/constants/fuel-tech.js'
import * as DT from '@/constants/v2/data-types.js'

export const state = () => ({
  isFetching: false,
  jsonResponses: null,
  energyRegions: getEnergyRegions(),
  energyDataset: [],
  energyFuelTechs: null
})

export const getters = {
  isFetching: state => state.isFetching,
  energyRegions: state => state.energyRegions,
  energyDataset: state => state.energyDataset,
  energyFuelTechs: state => state.energyFuelTechs
}

export const mutations = {
  isFetching(state, isFetching) {
    state.isFetching = isFetching
  },
  jsonResponses(state, jsonResponses) {
    state.jsonResponses = jsonResponses
  },
  energyDataset(state, energyDataset) {
    state.energyDataset = energyDataset
  },
  energyFuelTechs(state, energyFuelTechs) {
    state.energyFuelTechs = energyFuelTechs
  }
}

export const actions = {
  doGetRegionData({ commit }, { region, range }) {
    if (isValidRegion(region)) {
      const urls = Data.getEnergyUrls(region, range, 'prod')
      commit('isFetching', true)
      http(urls).then(responses => {
        const data = responses[0]
        initStore(commit, data)

        commit('isFetching', false)
        commit('jsonResponses', responses)
      })
    } else {
      throw new Error('Invalid region')
    }
  },

  doUpdateDatasetByGroup() {
    // with the grouping, recalculate the data
  }
}

function initStore(commit, data) {
  const dataPower = [],
    dataEnergy = []
  const powerFuelTechs = {},
    energyFuelTechs = {}

  // filter out each type to its own array
  data.forEach(d => {
    switch (d.type) {
      case DT.POWER:
        dataPower.push(d)
        break
      case DT.ENERGY:
        dataEnergy.push(d)
        break
      case DT.DEMAND:
      case DT.EMISSIONS:
      case DT.MARKET_VALUE:
      case DT.PRICE:
      case DT.TEMPERATURE:
      case DT.TEMPERATURE_MIN:
      case DT.TEMPERATURE_MEAN:
      case DT.TEMPERATURE_MAX:
        break
      default:
        console.warn(`Parsing json error: unknown data type found - ${d.type}`)
    }
  })

  checkPowerEnergyExists({ dataPower, dataEnergy })

  // set up into its right order
  FT.DEFAULT_FUEL_TECH_ORDER.forEach(ft => {
    const dataPowerFT = dataPower.find(d => d.fuel_tech === ft)
    const dataEnergyFT = dataEnergy.find(d => d.fuel_tech === ft)
    if (dataPowerFT) {
      powerFuelTechs[ft] = dataPowerFT.id
    }
    if (dataEnergyFT) {
      energyFuelTechs[ft] = dataEnergyFT.id
    }
  })

  // setup energy dataset
  const fuelTechs = dataPower.length > 0 ? powerFuelTechs : energyFuelTechs
  const useData = dataPower.length > 0 ? dataPower : dataEnergy

  // setup block of time for array.
  // Block of time can come from data or presets
  // start, end, interval
  const { start, end, num, intervalKey, intervalValue } = getStartEndNum(
    useData[0]
  )
  const dataset = []
  let currentDate = start
  for (let i = 1; i <= num; i++) {
    dataset.push({
      date: currentDate,
      time: currentDate.getTime()
    })
    currentDate = incrementTime({
      date: currentDate,
      intervalKey,
      intervalValue
    })
  }
  useData.forEach(d => {
    const historyData = d.history.data
    // if different interval, deal with 30m
    if (d.fuel_tech === 'rooftop_solar') {
      console.log(d)
    }
    dataset.forEach((h, i) => {
      h[d.id] = historyData[i] || null
    })
  })

  console.log(dataset.length, num, fuelTechs)
  console.log(dataset)

  commit('energyFuelTechs', fuelTechs)
}
