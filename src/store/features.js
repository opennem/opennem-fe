/* eslint-disable */
import { lsGet, lsSet } from '@/lib/localstorage';
import * as MutationTypes from '@/constants/mutation-types';

// set up local storage
if (!lsGet(MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA)) {
  lsSet(MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA, false);
}
if (!lsGet(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES)) {
  lsSet(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES, false);
}
if (!lsGet(MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE)) {
  lsSet(MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE, false);
}

const state = {
  externalData: lsGet(MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA),
  moreDateRanges: lsGet(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES),
  recordsTable: lsGet(MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE),
};

const mutations = {
  [MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA](state, data) {
    lsSet(MutationTypes.FEATURE_TOGGLE_EXTERNAL_DATA, data);
    state.externalData = data;
  },
  [MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES](state, data) {
    lsSet(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES, data);
    state.moreDateRanges = data;
  },
  [MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE](state, data) {
    lsSet(MutationTypes.FEATURE_TOGGLE_RECORDS_TABLE, data);
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
