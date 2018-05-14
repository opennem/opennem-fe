/* eslint-disable */
import * as MutationTypes from './mutation-types';

const state = {
  exportData: [],
  exportRegion: null,
  exportPng: false,
};

const mutations = {
  [MutationTypes.EXPORT_DATA](state, data) {
    state.exportData = data;
  },
  [MutationTypes.EXPORT_REGION](state, data) {
    state.exportRegion = data;
  },
  [MutationTypes.EXPORT_PNG](state, data) {
    state.exportPng = data;
  },
};

const getters = {
  getExportData: state => {
    return state.exportData;
  },
  getExportRegion: state => {
    return state.exportRegion;
  },
  isExportPng: state => {
    return state.exportPng;
  },
};

const actions = {
  setExportData({ commit, state }, data) {
    commit(MutationTypes.EXPORT_DATA, data);
  },
  setExportRegion({ commit, state }, data) {
    commit(MutationTypes.EXPORT_REGION, data);
  },
  setExportPng({ commit, state }, data) {
    commit(MutationTypes.EXPORT_PNG, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
