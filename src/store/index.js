/* eslint-disable */
import Vue from 'vue';
import Vuex from 'vuex';
import { getSummary, getPointSummary } from '@/lib/data-summary';
import { dataFilter } from '@/lib/data-helpers';
import { formatDateForExport } from '@/lib/formatter';
import { DateRanges } from '@/domains/date-ranges';
import * as MutationTypes from './mutation-types';
import exportStore from './export';
import summary from './summary';
import dates from './dates';
import panels from './panels';

Vue.use(Vuex);

const state = {
  domains: {},
  isFetching: false,
  fetchError: false,
  fetchErrorMessage: '',
  isChartZoomed: false,
  visType: 'power', // power or energy
  groupToPeriods: DateRanges[1].groupToPeriods,
};

const mutations = {
  [MutationTypes.DOMAINS](state, data) {
    state.domains = data;
  },
  [MutationTypes.FETCHING](state, data) {
    if (data) {
      // when fetching, always turn off point hover
      state.summary.isPointHovered = false;
    }
    state.isFetching = data;
  },
  [MutationTypes.FETCH_ERROR](state, data) {
    state.fetchError = data;
  },
  [MutationTypes.FETCH_ERROR_MESSAGE](state, data) {
    state.fetchErrorMessage = data;
  },
  [MutationTypes.CHART_ZOOMED](state, data) {
    state.isChartZoomed = data;
  },
  [MutationTypes.VIS_TYPE](state, data) {
    state.visType = data;
  },
  [MutationTypes.GROUP_TO_PERIODS](state, data) {
    state.groupToPeriods = data;
  },
};

const getters = {
  getDomains: state => {
    return state.domains;
  },
  isFetching: state => {
    return state.isFetching;
  },
  fetchError: state => {
    return state.fetchError;
  },
  fetchErrorMessage: state => {
    return state.fetchErrorMessage;
  },
  isChartZoomed: state => {
    return state.isChartZoomed;
  },
  visType: state => {
    return state.visType;
  },
  groupToPeriods: state => {
    return state.groupToPeriods;
  },
  isPower: state => {
    return state.visType === 'power';
  },
  getExportName: state => {
    return `${formatDateForExport(state.dates.selectedDates.end)} ${state.exportStore.exportRegion}`;
  },
};

const actions = {
  setDomains({ commit, state }, data) {
    commit(MutationTypes.DOMAINS, data);
  },
  fetchingData({ commit, state }, data) {
    commit(MutationTypes.FETCHING, data);
  },
  fetchError({ commit, state }, data) {
    commit(MutationTypes.FETCH_ERROR, data);
  },
  fetchErrorMessage({ commit, state }, data) {
    commit(MutationTypes.FETCH_ERROR_MESSAGE, data);
  },
  generateRangeSummary({ commit, state }, data) {
    const isPower = state.visType === 'power';
    const filtered = dataFilter(data.data, data.start, data.end);
    const summary = getSummary(state.domains, filtered, isPower);
    commit(MutationTypes.RANGE_SUMMARY, summary);
  },
  generatePointSummary({ commit, state }, data) {
    const summary = getPointSummary(state.domains, data.date, data.dataContext);
    commit(MutationTypes.POINT_SUMMARY, summary);
  },
  setChartZoomed({ commit, state }, data) {
    commit(MutationTypes.CHART_ZOOMED, data);
  },
  setVisType({ commit, state }, data) {
    commit(MutationTypes.VIS_TYPE, data);
  },
  groupToPeriods({ commit, state }, data) {
    commit(MutationTypes.GROUP_TO_PERIODS, data);
  },
};

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  modules: {
    exportStore,
    summary,
    dates,
    panels,
  }
});

export default store;
