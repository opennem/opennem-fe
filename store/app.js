export const state = () => ({
  windowWidth: 600
})

export const getters = {
  windowWidth: state => state.windowWidth,
  widthBreak: state => state.windowWidth < 1024,
  tabletBreak: state => state.windowWidth < 769
}

export const mutations = {
  windowWidth(state, windowWidth) {
    state.windowWidth = windowWidth
  }
}

export const actions = {}
