/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  rangeSummary: {},
  pointSummary: {},
  isPointHovered: false,
  contributionType: 'generation', // or 'demand'
};

const mutations = {
  [MutationTypes.RANGE_SUMMARY](state, data) {
    state.rangeSummary = data;
  },
  [MutationTypes.POINT_SUMMARY](state, data) {
    state.pointSummary = data;
  },
  [MutationTypes.POINT_HOVERED](state, data) {
    state.isPointHovered = data;
  },
  [MutationTypes.CONTRIBUTION_TYPE](state, data) {
    state.contributionType = data;
  },
};

const getters = {
  getRangeSummary: state => {
    return state.rangeSummary;
  },
  getPointSummary: state => {
    return state.pointSummary;
  },
  isPointHovered: state => {
    return state.isPointHovered;
  },
  contributionType: state => {
    return state.contributionType;
  },
};

const actions = {
  showInstantaneousData({ commit, state }, data) {
    commit(MutationTypes.POINT_HOVERED, data);
  },
  contributionType({ commit, state }, data) {
    commit(MutationTypes.CONTRIBUTION_TYPE, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
