import * as FUEL_TECHS from '~/constants/fuelTech.js'
import cloneDeep from 'lodash.clonedeep'

export const state = () => ({
  names: ['1', '2'],
  order: cloneDeep(FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER)
})

export const mutations = {
  names(state, names) {
    state.names = names
  },

  order(state, data) {
    state.order = data
  }
}

export const getters = {
  names: state => state.names,
  order: state => state.order
}

export const actions = {
  names({ commit }, data) {
    commit('names', data)
  },
  order({ commit }, data) {
    commit('order', data)
  }
}
