/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  rangeSummary: {},
  pointSummary: {},
  isPointHovered: false,
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
};

const actions = {
  showInstantaneousData({ commit, state }, data) {
    commit(MutationTypes.POINT_HOVERED, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
