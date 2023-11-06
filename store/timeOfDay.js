export const state = () => ({
  selectedToDs: [],
  detailedAveragesDataset: [],
  averagesDataset: [],
  filteredDates: []
})

export const getters = {
  selectedToDs: (state) => state.selectedToDs,
  detailedAveragesDataset: (state) => state.detailedAveragesDataset,
  averagesDataset: (state) => state.averagesDataset,
  filteredDates: (state) => state.filteredDates,
  filteredAveragesDataset: (state) => {
      return state.filteredDates.length > 0
        ? state.averagesDataset.filter(
            (d) =>
              d.time >= state.filteredDates[0].getTime() &&
              d.time <= state.filteredDates[1].getTime()
          )
        : state.averagesDataset
  }
}

export const mutations = {
  selectedToDs(state, selectedToDs) {
    state.selectedToDs = selectedToDs
  },
  detailedAveragesDataset(state, detailedAveragesDataset) {
    state.detailedAveragesDataset = detailedAveragesDataset
  },
  averagesDataset(state, averagesDataset) {
    state.averagesDataset = averagesDataset
  },
  filteredDates(state, filteredDates) {
    state.filteredDates = filteredDates
  }
}

export const actions = {}
