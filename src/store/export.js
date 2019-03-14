/* eslint-disable */
import { lsGet, lsSet } from '@/lib/localstorage';
import * as MutationTypes from '@/constants/mutation-types';

// set up local storage
if (!lsGet(MutationTypes.EXPORT_ATTRIBUTION)) {
  lsSet(MutationTypes.EXPORT_ATTRIBUTION, '@name');
}

const state = {
  exportData: [],
  exportRegion: null,
  exportPng: false,
  exportShowPercent: true,
  exportAttribution: lsGet(MutationTypes.EXPORT_ATTRIBUTION),
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
  [MutationTypes.EXPORT_ATTRIBUTION](state, data) {
    lsSet(MutationTypes.EXPORT_ATTRIBUTION, data);
    state.exportAttribution = data;
  },
  [MutationTypes.EXPORT_SHOW_PERCENT](state, data) {
    state.exportShowPercent = data;
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
  exportAttribution: state => {
    return state.exportAttribution;
  },
  exportShowPercent: state => {
    return state.exportShowPercent;
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
  exportAttribution({ commit, state }, data) {
    commit(MutationTypes.EXPORT_ATTRIBUTION, data);
  },
  exportShowPercent({ commit, state }, data) {
    commit(MutationTypes.EXPORT_SHOW_PERCENT, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
