/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

// set up local storage
if (localStorage.getItem(MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA) === null) {
  localStorage.setItem(MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA, false);
}
if (localStorage.getItem(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES) === null) {
  localStorage.setItem(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES, false);
}
if (localStorage.getItem(MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE) === null) {
  localStorage.setItem(MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE, false);
}

const state = {
  externalData: localStorage.getItem(MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA) === 'true' ? true : false,
  moreDateRanges: localStorage.getItem(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES) === 'true' ? true : false,
  recordsTable: localStorage.getItem(MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE) === 'true' ? true : false,
};

const mutations = {
  [MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA](state, data) {
    localStorage.setItem(MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA, data);
    state.externalData = data;
  },
  [MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES](state, data) {
    localStorage.setItem(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES, data);
    state.moreDateRanges = data;
  },
  [MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE](state, data) {
    localStorage.setItem(MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE, data);
    state.recordsTable = data;
  },
};

const getters = {
  externalData: state => {
    return state.externalData;
  },
  moreDateRanges: state => {
    return state.moreDateRanges;
  },
  recordsTable: state => {
    return state.recordsTable;
  },
};

const actions = {
  externalData({ commit, state }, data) {
    commit(MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA, data);
  },
  moreDateRanges({ commit, state }, data) {
    commit(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES, data);
  },
  recordsTable({ commit, state }, data) {
    commit(MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
