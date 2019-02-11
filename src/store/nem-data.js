/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  nemUrls: [],
  nemData: [],
  nemTrim: false,
  nemDataTrim: {
    start: null,
    end: null,
  },
  responseData: [],
};

const mutations = {
  [MutationTypes.NEM_URLS](state, data) {
    state.nemUrls = data;
  },
  [MutationTypes.NEM_DATA](state, data) {
    state.nemData = data;
  },
  [MutationTypes.NEM_TRIM](state, data) {
    state.nemTrim = data;
  },
  [MutationTypes.NEM_DATA_TRIM](state, data) {
    state.nemDataTrim = data;
  },
  [MutationTypes.NEM_RESPONSE_DATA](state, data) {
    state.responseData = data;
  },
};

const getters = {
  nemUrls: state => {
    return state.nemUrls;
  },
  nemData: state => {
    return state.nemData;
  },
  nemTrim: state => {
    return state.nemTrim;
  },
  nemDataTrim: state => {
    return state.nemDataTrim;
  },
  responseData: state => {
    return state.responseData;
  },
};

const actions = {
  nemUrls({ commit, state }, data) {
    commit(MutationTypes.NEM_URLS, data);
  },
  nemTrim({ commit, state }, data) {
    commit(MutationTypes.NEM_TRIM, data);
  },
  nemDataTrim({ commit, state }, data) {
    commit(MutationTypes.NEM_DATA_TRIM, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
