/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';
import { lsGet, lsSet } from '@/lib/localstorage';

if (!lsGet(MutationTypes.CONTRIBUTION_TYPE)) {
  lsSet(MutationTypes.CONTRIBUTION_TYPE, 'generation');
}

const state = {
  rangeSummary: {},
  pointSummary: {},
  groupPointSummary: {},
  isPointHovered: false,
  contributionType: lsGet(MutationTypes.CONTRIBUTION_TYPE),
  disabledSeries: [],
};

const mutations = {
  [MutationTypes.RANGE_SUMMARY](state, data) {
    state.rangeSummary = data;
  },
  [MutationTypes.POINT_SUMMARY](state, data) {
    state.pointSummary = data;
  },
  [MutationTypes.GROUP_POINT_SUMMARY](state, data) {
    state.groupPointSummary = data;
  },
  [MutationTypes.POINT_HOVERED](state, data) {
    state.isPointHovered = data;
  },
  [MutationTypes.CONTRIBUTION_TYPE](state, data) {
    lsSet(MutationTypes.CONTRIBUTION_TYPE, data);
    state.contributionType = data;
  },
  [MutationTypes.SUMMARY_DISABLED_SERIES](state, data) {
    state.disabledSeries = data;
  },
};

const getters = {
  getRangeSummary: state => {
    return state.rangeSummary;
  },
  getPointSummary: state => {
    return state.pointSummary;
  },
  groupPointSummary: state => {
    return state.groupPointSummary;
  },
  isPointHovered: state => {
    return state.isPointHovered;
  },
  contributionType: state => {
    return state.contributionType;
  },
  disabledSeries: state => {
    return state.disabledSeries;
  },
};

const actions = {
  showInstantaneousData({ commit, state }, data) {
    commit(MutationTypes.POINT_HOVERED, data);
  },
  groupPointSummary({ commit, state }, data) {
    commit(MutationTypes.GROUP_POINT_SUMMARY, data);
  },
  contributionType({ commit, state }, data) {
    commit(MutationTypes.CONTRIBUTION_TYPE, data);
  },
  disabledSeries({ commit, state }, data) {
    commit(MutationTypes.SUMMARY_DISABLED_SERIES, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
