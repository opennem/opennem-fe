import EnergyDataTransform from '@/services/dataTransform/Energy.js'
import Domain from '@/services/Domain.js'
import * as FUEL_TECHS from '@/constants/fuel-tech.js'

import axios from 'axios'

const http = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

export const state = () => ({
  isFetching: false,
  energyDataset: [],
  energyDomains: [],
  energyPercentDomains: []
})

export const getters = {
  isFetching: state => state.isFetching,
  energyDataset: state => state.energyDataset,
  energyDomains: state => state.energyDomains,
  energyPercentDomains: state => state.energyPercentDomains
}

export const mutations = {
  isFetching(state, isFetching) {
    state.isFetching = isFetching
  },
  energyDataset(state, energyDataset) {
    state.energyDataset = energyDataset
  },
  energyDomains(state, energyDomains) {
    state.energyDomains = energyDomains
  },
  energyPercentDomains(state, energyPercentDomains) {
    state.energyPercentDomains = energyPercentDomains
  }
}

export const actions = {
  doGetWA({ commit }) {
    console.log('get WA')
    const fuelTechOrder = [...FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER]

    http
      .get(
        'https://s3-ap-southeast-2.amazonaws.com/data.opennem.org.au/power/wa1.json'
      )
      .then(d => d.data)
      .then(waData => {
        const domains = Domain.getEnergyDomains([waData])
        const fuelTechEnergyOrder = Domain.getDomainObjsOrder(
          domains,
          fuelTechOrder
        )
        const energyDomains = Domain.getDomainObjs(
          'wa',
          fuelTechEnergyOrder,
          'energy'
        )

        const energyPercentDomains = Domain.getDomainObjs(
          'wa',
          fuelTechEnergyOrder,
          'energy_percent'
        )
        console.log(energyDomains, waData)

        commit('energyDomains', energyDomains)
        commit('energyPercentDomains', energyPercentDomains)

        EnergyDataTransform.mergeResponses(
          [waData],
          energyDomains,
          [],
          [],
          [],
          [],
          '7D',
          '30m'
        ).then(data => commit('energyDataset', data))
      })
  }
}
