/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  nemUrls: [],
  nemData: [],
  groupedNemData: [],
  nemTrim: false,
  nemDataTrim: {
    start: null,
    end: null,
  },
  responseData: [],
  tera: false, // whether to convert the values
};

const mutations = {
  [MutationTypes.NEM_URLS](state, data) {
    state.nemUrls = data;
  },
  [MutationTypes.NEM_DATA](state, data) {
    state.nemData = data;
  },
  [MutationTypes.GROUPED_NEM_DATA](state, data) {
    state.groupedNemData = data;
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
  [MutationTypes.NEM_TERA](state, data) {
    state.tera = data;
  },
};

const getters = {
  nemUrls: state => {
    return state.nemUrls;
  },
  nemData: state => {
    return state.nemData;
  },
  groupedNemData: state => {
    return state.groupedNemData;
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
  tera: state => {
    return state.tera;
  },
};

const actions = {
  nemUrls({ commit, state }, data) {
    commit(MutationTypes.NEM_URLS, data);
  },
  nemTrim({ commit, state }, data) {
    commit(MutationTypes.NEM_TRIM, data);
  },
  groupedNemData({ commit, state }, data) {
    commit(MutationTypes.GROUPED_NEM_DATA, data);
  },
  nemDataTrim({ commit, state }, data) {
    commit(MutationTypes.NEM_DATA_TRIM, data);
  },
  tera({ commit, state }, data) {
    commit(MutationTypes.NEM_TERA, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
