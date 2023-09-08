export const state = () => ({
  range: 7,
  interval: 30,
  timeDomains: []
})

export const getters = {
  range: (state) => state.range,
  interval: (state) => state.interval,
  timeDomains: (state) => state.timeDomains,
}

export const mutations = {
  range(state, range) {
    state.range = range
  },
  interval(state, interval) {
    state.interval = interval
  },
  timeDomains(state, timeDomains) {
    state.timeDomains = timeDomains
  }
}

export const actions = {
  doUpdateError({ commit }, { header, message }) {
    commit('showError', true)
    commit('errorHeader', header)
    commit('errorMessage', message)
  }
}
