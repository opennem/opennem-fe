export const state = () => ({
  showAnnualSource: false
})

export const getters = {
  showAnnualSource: state => state.showAnnualSource
}

export const mutations = {
  showAnnualSource(state, data) {
    state.showAnnualSource = data
  }
}

export const actions = {}
