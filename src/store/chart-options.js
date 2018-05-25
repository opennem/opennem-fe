/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';
import { DateRanges } from '@/domains/date-ranges';

const defaultDateRange = DateRanges[1]
const state = {
  isChartZoomed: false,
  minPeriod: defaultDateRange.minPeriod,
  groupToPeriods: defaultDateRange.groupToPeriods,
};

const mutations = {
  [MutationTypes.CHART_ZOOMED](state, data) {
    state.isChartZoomed = data;
  },
  [MutationTypes.CHART_MIN_PERIOD](state, data) {
    state.minPeriod = data;
  },
  [MutationTypes.CHART_GROUP_TO_PERIODS](state, data) {
    state.groupToPeriods = data;
  },
};

const getters = {
  isChartZoomed: state => {
    return state.isChartZoomed;
  },
  minPeriod: state => {
    return state.minPeriod;
  },
  groupToPeriods: state => {
    return state.groupToPeriods;
  },
};

const actions = {
  setChartZoomed({ commit, state }, data) {
    commit(MutationTypes.CHART_ZOOMED, data);
  },
  minPeriod({ commit, state }, data) {
    commit(MutationTypes.CHART_MIN_PERIOD, data);
  },
  groupToPeriods({ commit, state }, data) {
    commit(MutationTypes.CHART_GROUP_TO_PERIODS, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
