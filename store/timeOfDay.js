export const state = () => ({
  selectedToDs: []
})

export const getters = {
  selectedToDs: (state) => state.selectedToDs
}

export const mutations = {
  selectedToDs(state, selectedToDs) {
    state.selectedToDs = selectedToDs
  }
}

export const actions = {}
