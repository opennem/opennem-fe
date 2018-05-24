/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  nemData: [],
};

const mutations = {
  [MutationTypes.NEM_DATA](state, data) {
    state.nemData = data;
  },
};

const getters = {
  nemData: state => {
    return state.nemData;
  },
};

const actions = {};

export default {
  state,
  mutations,
  getters,
  actions,
};
