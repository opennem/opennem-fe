/* eslint-disable */
import Vue from 'vue';
import Vuex from 'vuex';
import { getSummary, getPointSummary } from '@/lib/data-summary';
import { dataFilter } from '@/lib/data-helpers';
import { formatDateForExport } from '@/lib/formatter';

import * as MutationTypes from './mutation-types';
import exportStore from './export';
import summary from './summary';
import dates from './dates';

Vue.use(Vuex);

const state = {
  domains: {},
  isFetching: false,
  isChartZoomed: false,
  showTemperaturePanel: true,
  showPricePanel: true,
  showSummaryPanel: false,
  visType: 'power', // power or energy
};

const mutations = {
  updateDomains(state, data) {
    state.domains = data;
  },
  updatingIsFetching(state, data) {
    if (data) {
      // when fetching, always turn off point hover
      state.summary.isPointHovered = false;
    }
    state.isFetching = data;
  },
  updateIsChartZoomed(state, data) {
    state.isChartZoomed = data;
  },
  showTemperaturePanel(state, data) {
    state.showTemperaturePanel = data;
  },
  showPricePanel(state, data) {
    state.showPricePanel = data;
  },
  showSummaryPanel(state, data) {
    state.showSummaryPanel = data;
  },
  updateVisType(state, data) {
    state.visType = data;
  },
};

const getters = {
  getDomains: state => {
    return state.domains;
  },
  isFetching: state => {
    return state.isFetching;
  },
  isChartZoomed: state => {
    return state.isChartZoomed;
  },
  getExportName: state => {
    return `${formatDateForExport(state.selectedDates.end)} ${state.exportStore.exportRegion}`;
  },
  showTemperaturePanel: state => {
    return state.showTemperaturePanel;
  },
  showPricePanel: state => {
    return state.showPricePanel;
  },
  showSummaryPanel: state => {
    return state.showSummaryPanel;
  },
  visType: state => {
    return state.visType;
  },
  isPower: state => {
    return state.visType === 'power';
  },
};

const actions = {
  setDomains({ commit, state }, data) {
    commit('updateDomains', data);
  },
  fetchingData({ commit, state }, data) {
    commit('updatingIsFetching', data);
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
    commit('updateIsChartZoomed', data);
  },
  setTemperaturePanel({ commit, state }, data) {
    commit('showTemperaturePanel', data);
  },
  setPricePanel({ commit, state }, data) {
    commit('showPricePanel', data);
  },
  setSummaryPanel({ commit, state }, data) {
    commit('showSummaryPanel', data);
  },
  resetPanels({ commit, state }) {
    commit('showTemperaturePanel', true);
    commit('showPricePanel', true);
    commit('showSummaryPanel', true);
  },
  setVisType({ commit, state }, data) {
    commit('updateVisType', data);
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
  }
});

export default store;
