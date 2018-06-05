/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  error: false,
  errorMessage: '',
};

const mutations = {
  [MutationTypes.ERROR](state, data) {
    state.error = data;
  },
  [MutationTypes.ERROR_MESSAGE](state, data) {
    state.errorMessage = data;
  },
};

const getters = {
  error: state => {
    return state.error;
  },
  errorMessage: state => {
    return state.errorMessage;
  },
};

const actions = {
  error({ commit, state }, data) {
    commit(MutationTypes.ERROR, data);
  },
  errorMessage({ commit, state }, data) {
    commit(MutationTypes.ERROR_MESSAGE, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
