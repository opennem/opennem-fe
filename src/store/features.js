/* eslint-disable */
import { lsGet, lsSet } from '@/lib/localstorage';
import * as MutationTypes from '@/constants/mutation-types';

// set up local storage
if (!lsGet(MutationTypes.FEATURE_TOGGLE_LOCAL_DATA)) {
  lsSet(MutationTypes.FEATURE_TOGGLE_LOCAL_DATA, false);
}
if (!lsGet(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES)) {
  lsSet(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES, false);
}

const state = {
  localData: lsGet(MutationTypes.FEATURE_TOGGLE_LOCAL_DATA),
  moreDateRanges: lsGet(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES),
};

const mutations = {
  [MutationTypes.FEATURE_TOGGLE_LOCAL_DATA](state, data) {
    lsSet(MutationTypes.FEATURE_TOGGLE_LOCAL_DATA, data);
    state.localData = data;
  },
  [MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES](state, data) {
    lsSet(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES, data);
    state.moreDateRanges = data;
  },
};

const getters = {
  localData: state => {
    return state.localData;
  },
  moreDateRanges: state => {
    return state.moreDateRanges;
  },
};

const actions = {
  localData({ commit, state }, data) {
    commit(MutationTypes.FEATURE_TOGGLE_LOCAL_DATA, data);
  },
  moreDateRanges({ commit, state }, data) {
    commit(MutationTypes.FEATURE_TOGGLE_MORE_DATE_RANGES, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
