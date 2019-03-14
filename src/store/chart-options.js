/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';
import { DateRanges } from '@/domains/date-ranges';

const defaultDateRange = DateRanges[1]
const state = {
  isChartZoomed: false,
  chartTypeTransition: false,
  period: null,
  minPeriod: defaultDateRange.minPeriod,
  groupToPeriods: defaultDateRange.groupToPeriods,
  currentHoverSeries: null,
};

const mutations = {
  [MutationTypes.CHART_ZOOMED](state, data) {
    state.isChartZoomed = data;
  },
  [MutationTypes.CHART_TYPE_TRANSITION](state, data) {
    state.chartTypeTransition = data;
  },
  [MutationTypes.CHART_PERIOD](state, data) {
    state.period = data;
  },
  [MutationTypes.CHART_MIN_PERIOD](state, data) {
    state.minPeriod = data;
  },
  [MutationTypes.CHART_GROUP_TO_PERIODS](state, data) {
    state.groupToPeriods = data;
  },
  [MutationTypes.CHART_CURRENT_HOVER_SERIES](state, data) {
    state.currentHoverSeries = data;
  },
};

const getters = {
  isChartZoomed: state => {
    return state.isChartZoomed;
  },
  chartTypeTransition: state => {
    return state.chartTypeTransition;
  },
  period: state => {
    return state.period;
  },
  minPeriod: state => {
    return state.minPeriod;
  },
  groupToPeriods: state => {
    return state.groupToPeriods;
  },
  currentHoverSeries: state => {
    return state.currentHoverSeries;
  },
};

const actions = {
  setChartZoomed({ commit, state }, data) {
    commit(MutationTypes.CHART_ZOOMED, data);
  },
  chartTypeTransition({ commit, state }, data) {
    commit(MutationTypes.CHART_TYPE_TRANSITION, data);
  },
  period({ commit, state }, data) {
    commit(MutationTypes.CHART_PERIOD, data);
  },
  minPeriod({ commit, state }, data) {
    commit(MutationTypes.CHART_MIN_PERIOD, data);
  },
  groupToPeriods({ commit, state }, data) {
    commit(MutationTypes.CHART_GROUP_TO_PERIODS, data);
  },
  currentHoverSeries({ commit, state }, data) {
    commit(MutationTypes.CHART_CURRENT_HOVER_SERIES, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
