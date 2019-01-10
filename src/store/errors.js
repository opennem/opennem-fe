/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  error: false,
  errorMessage: '',
  warning: false,
  warningMessage: '',
};

const mutations = {
  [MutationTypes.ERROR](state, data) {
    state.error = data;
  },
  [MutationTypes.ERROR_MESSAGE](state, data) {
    state.errorMessage = data;
  },
  [MutationTypes.WARNING](state, data) {
    state.warning = data;
  },
  [MutationTypes.WARNING_MESSAGE](state, data) {
    state.warningMessage = data;
  },
};

const getters = {
  error: state => {
    return state.error;
  },
  errorMessage: state => {
    return state.errorMessage;
  },
  warning: state => {
    return state.warning;
  },
  warningMessage: state => {
    return state.warningMessage;
  },
};

const actions = {
  error({ commit, state }, data) {
    commit(MutationTypes.ERROR, data);
  },
  errorMessage({ commit, state }, data) {
    commit(MutationTypes.ERROR_MESSAGE, data);
  },
  warning({ commit, state }, data) {
    commit(MutationTypes.WARNING, data);
  },
  warningMessage({ commit, state }, data) {
    commit(MutationTypes.WARNING_MESSAGE, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
