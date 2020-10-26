export const state = () => ({
  windowWidth: 600,
  showBanner: false
})

export const getters = {
  windowWidth: state => state.windowWidth,
  widthBreak: state => state.windowWidth < 1024,
  tabletBreak: state => state.windowWidth < 769,
  showBanner: state => state.showBanner
}

export const mutations = {
  windowWidth(state, windowWidth) {
    state.windowWidth = windowWidth
  },
  showBanner(state, showBanner) {
    state.showBanner = showBanner
  }
}

export const actions = {}
