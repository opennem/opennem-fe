/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  nemData: [],
  responseData: [],
};

const mutations = {
  [MutationTypes.NEM_DATA](state, data) {
    state.nemData = data;
  },
  [MutationTypes.NEM_RESPONSE_DATA](state, data) {
    state.responseData = data;
  },
};

const getters = {
  nemData: state => {
    return state.nemData;
  },
  responseData: state => {
    return state.responseData;
  },
};

const actions = {};

export default {
  state,
  mutations,
  getters,
  actions,
};
