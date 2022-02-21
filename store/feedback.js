import _cloneDeep from 'lodash.clonedeep'
import http from '@/services/Api.js'

export const state = () => ({
  showFields: false,
  selectedFields: []
})

export const mutations = {
  showFields(state, data) {
    state.showFields = data
  },
  selectedFields(state, data) {
    state.selectedFields = data
  }
}

export const getters = {
  showFields: state => state.showFields,
  selectedFields: state => _cloneDeep(state.selectedFields)
}

export const actions = {
  addField({ commit, state }, field) {
    const fields = _cloneDeep(state.selectedFields)
    const find = fields.find(f => f.key === field.key)
    if (!find) {
      fields.push(field)
      commit('selectedFields', fields)
    }
  },

  removeIssueField({ commit, state }, field) {
    const fields = state.selectedFields.filter(f => f.key !== field.key)
    commit('selectedFields', fields)
  },

  clearIssueFields({ commit }) {
    commit('selectedFields', [])
  },

  submit({}, payload) {
    return http.request({
      url: '/feedback',
      method: 'post',
      data: payload
    })
  }
}
