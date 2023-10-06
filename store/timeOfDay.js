export const state = () => ({
  selectedToDs: [],
  averagesDataset: []
})

export const getters = {
  selectedToDs: (state) => state.selectedToDs,
  averagesDataset: (state) => state.averagesDataset
}

export const mutations = {
  selectedToDs(state, selectedToDs) {
    state.selectedToDs = selectedToDs
  },
  averagesDataset(state, averagesDataset) {
    state.averagesDataset = averagesDataset
  }
}

export const actions = {}
