export const state = () => ({
  apiVersion: null,
  windowWidth: 600,
  isTouchDevice: false,
  showError: false,
  errorHeader: '',
  errorMessage: '',
  query: null,
  facilitiesQuery: null,
  showFeatureToggle: false,
  siteAnnouncement: process.env.SITEWIDE_ANNOUNCEMENT
})

export const getters = {
  apiVersion: (state) => state.apiVersion,
  windowWidth: (state) => state.windowWidth,
  isTouchDevice: (state) => state.isTouchDevice,
  wideScreenBreak: (state) => state.windowWidth < 1450,
  widthBreak: (state) => state.windowWidth < 1024,
  tabletBreak: (state) => state.windowWidth < 769,
  showError: (state) => state.showError,
  errorHeader: (state) => state.errorHeader,
  errorMessage: (state) => state.errorMessage,
  query: (state) => state.query,
  facilitiesQuery: (state) => state.facilitiesQuery,
  showFeatureToggle: (state) => state.showFeatureToggle,
  siteAnnouncement: (state) => state.siteAnnouncement
}

export const mutations = {
  apiVersion(state, apiVersion) {
    state.apiVersion = apiVersion
  },
  windowWidth(state, windowWidth) {
    state.windowWidth = windowWidth
  },
  isTouchDevice(state, isTouchDevice) {
    state.isTouchDevice = isTouchDevice
  },
  showError(state, showError) {
    state.showError = showError
  },
  errorHeader(state, errorHeader) {
    state.errorHeader = errorHeader
  },
  errorMessage(state, errorMessage) {
    state.errorMessage = errorMessage
  },
  query(state, query) {
    state.query = query
  },
  facilitiesQuery(state, query) {
    state.facilitiesQuery = query
  },
  showFeatureToggle(state, showFeatureToggle) {
    state.showFeatureToggle = showFeatureToggle
  }
}

export const actions = {
  doUpdateError({ commit }, { header, message }) {
    commit('showError', true)
    commit('errorHeader', header)
    commit('errorMessage', message)
  },
  doClearError({ commit }) {
    commit('showError', false)
    commit('errorHeader', '')
    commit('errorMessage', '')
  }
}
