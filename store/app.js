export const state = () => ({
  windowWidth: 600,
  showBanner: false,
  query: null
})

export const getters = {
  windowWidth: state => state.windowWidth,
  widthBreak: state => state.windowWidth < 1024,
  tabletBreak: state => state.windowWidth < 769,
  showBanner: state => state.showBanner,
  query: state => state.query
}

export const mutations = {
  windowWidth(state, windowWidth) {
    state.windowWidth = windowWidth
  },
  showBanner(state, showBanner) {
    state.showBanner = showBanner
  },
  query(state, query) {
    state.query = query
  }
}

export const actions = {}
