
export const state = () => ({
  currentDataset: [] 
})

export const getters = {
  currentDataset: (state) => state.currentDataset
}

export const mutations = {
  currentDataset(state, currentDataset) {
    state.currentDataset = currentDataset
  }
}

export const actions = {}
