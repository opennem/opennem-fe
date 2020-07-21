import differenceInDays from 'date-fns/differenceInDays'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import addDays from 'date-fns/addDays'
import addMinutes from 'date-fns/addMinutes'
import http from '@/services/Http.js'
import PerfTime from '@/plugins/perfTime.js'
import { getEnergyRegions } from '@/constants/v2/energy-regions.js'
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
  doGetRegionData({ commit }, region) {
    console.log(region)
    // if VALID region?

    commit('isFetching', true)
    // const urls = ['testing/nem/energy/daily/2020.json']
    const urls = ['power/nem.json']
    http(urls).then(responses => {
      const data = responses[0]
      initStore(commit, data)

      commit('isFetching', false)
      commit('jsonResponses', responses)
    })
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

  // check that data should not have both power and energy
  if (dataPower.length > 0 && dataEnergy.length > 0) {
    console.warn(
      'Parsing json error: data contains both power and energy',
      dataPower,
      dataEnergy
    )
  }

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

  console.log(fuelTechs, useData[0])
  // check history object is valid

  // setup block of time for array.
  // Block of time can come from data or presets
  // start, end, interval
  const start = new Date('2020-07-09T17:25')
  const end = new Date('2020-07-16T17:25')
  const num = differenceInMinutes(end, start) / 5
  const dataset = []
  let currentDate = start
  for (let i = 1; i <= num; i++) {
    dataset.push({
      date: currentDate,
      time: currentDate.getTime()
    })
    currentDate = addMinutes(currentDate, 5)
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

  console.log(dataset.length, num, dataset, fuelTechs)

  commit('energyFuelTechs', fuelTechs)
}
