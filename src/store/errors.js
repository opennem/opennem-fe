/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  error: false,
  errorMessage: '',
};

const mutations = {
  [MutationTypes.FETCH_ERROR](state, data) {
    state.error = data;
  },
  [MutationTypes.FETCH_ERROR_MESSAGE](state, data) {
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
    commit(MutationTypes.FETCH_ERROR, data);
  },
  errorMessage({ commit, state }, data) {
    commit(MutationTypes.FETCH_ERROR_MESSAGE, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
