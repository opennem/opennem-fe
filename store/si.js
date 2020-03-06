export const state = () => ({
  emissionsVolumeUnit: 'tCO₂e',
  emissionsVolumePrefix: '',
  useEVnextPrefix: false
})

export const getters = {
  emissionsVolumeUnit: state =>
    `${state.emissionsVolumePrefix}${state.emissionsVolumeUnit}`,
  emissionsVolumePrefix: state => state.emissionsVolumePrefix,
  useEVnextPrefix: state => state.useEVnextPrefix
}

export const actions = {
  emissionsVolumeUnit({ commit }, data) {
    commit('emissionsVolumeUnit', data)
  },
  emissionsVolumePrefix({ commit }, data) {
    commit('emissionsVolumePrefix', data)
  },
  useEVnextPrefix({ commit }, data) {
    commit('useEVnextPrefix', data)
  }
}

export const mutations = {
  emissionsVolumeUnit(state, emissionsVolumeUnit) {
    state.emissionsVolumeUnit = emissionsVolumeUnit
  },
  emissionsVolumePrefix(state, data) {
    state.emissionsVolumePrefix = data
  },
  useEVnextPrefix(state, data) {
    state.useEVnextPrefix = data
  }
}
