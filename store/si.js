export const state = () => ({
  emissionsVolumeUnit: 'tCO₂e',
  emissionsVolumePrefix: ''
})

export const getters = {
  emissionsVolumeUnit: state =>
    `${state.emissionsVolumePrefix}${state.emissionsVolumeUnit}`,
  emissionsVolumePrefix: state => state.emissionsVolumePrefix
}

export const actions = {
  emissionsVolumeUnit({ commit }, data) {
    commit('emissionsVolumeUnit', data)
  },
  emissionsVolumePrefix({ commit }, data) {
    commit('emissionsVolumePrefix', data)
  }
}

export const mutations = {
  emissionsVolumeUnit(state, emissionsVolumeUnit) {
    state.emissionsVolumeUnit = emissionsVolumeUnit
  },
  emissionsVolumePrefix(state, data) {
    state.emissionsVolumePrefix = data
  }
}
