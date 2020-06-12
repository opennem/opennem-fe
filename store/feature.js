import { lsGet, lsSet } from '~/services/LocalStorage'

const MutationTypes = {
  FEATURE_TOGGLE_EMISSIONS: 'FEATURE_TOGGLE_EMISSIONS'
}
const emissions = lsGet(MutationTypes.FEATURE_TOGGLE_EMISSIONS)
if (!emissions) {
  lsSet(MutationTypes.FEATURE_TOGGLE_EMISSIONS, false)
}

export const state = () => ({
  emissions
})

export const getters = {
  emissions: state => state.emissions
}

export const mutations = {
  emissions(state, emissions) {
    lsSet(MutationTypes.FEATURE_TOGGLE_EMISSIONS, emissions)
    state.emissions = emissions
  }
}

export const actions = {}
