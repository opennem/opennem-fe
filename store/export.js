export const state = () => ({
  title: '',
  description: ''
})

export const mutations = {
  title(state, data) {
    state.title = data
  },
  description(state, data) {
    state.description = data
  }
}

export const getters = {
  title: state => state.title,
  description: state => state.description
}

export const actions = {
  title({ commit }, data) {
    commit('title', data)
  },
  description({ commit }, data) {
    commit('description', data)
  }
}
