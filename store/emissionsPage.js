export const state = () => ({
  footerSourceLabel: '',
  footerSourceUrl: ''
})

export const getters = {
  footerSourceLabel: state => state.footerSourceLabel,
  footerSourceUrl: state => state.footerSourceUrl
}

export const mutations = {
  footerSourceLabel(state, data) {
    state.footerSourceLabel = data
  },
  footerSourceUrl(state, data) {
    state.footerSourceUrl = data
  }
}

export const actions = {}
