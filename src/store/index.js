/* eslint-disable */
import Vue from 'vue';
import Vuex from 'vuex';
import { getSummary, getPointSummary } from '@/lib/data-summary';
import { dataFilter } from '@/lib/data-helpers';
import { formatDateForExport } from '@/lib/formatter';

Vue.use(Vuex);

const state = {
  domains: {},
  isFetching: false,
  rangeSummary: {},
  pointSummary: {},
  isChartZoomed: false,
  isPointHovered: false,
  dataEndDate: null,
  selectedDates: {
    start: null,
    end: null,
  },
  exportData: {
    name: '',
    data: [],
  },
};

const mutations = {
  updateDomains(state, data) {
    state.domains = data;
  },
  updatingIsFetching(state, data) {
    if (data) {
      // when fetching, always turn off point hover
      state.isPointHovered = false;
    }
    state.isFetching = data;
  },
  updateRangeSummary(state, data) {
    state.rangeSummary = data;
  },
  updatePointSummary(state, data) {
    state.pointSummary = data;
  },
  updateIsChartZoomed(state, data) {
    state.isChartZoomed = data;
  },
  updateSelectedDates(state, data) {
    state.selectedDates = data;
  },
  updateIsPointHovered(state, data) {
    state.isPointHovered = data;
  },
  updateDataEndDate(state, data) {
    state.dataEndDate = data;
  },
  updateExportData(state, data) {
    state.exportData = data;
  },
};

const getters = {
  getDomains: state => {
    return state.domains;
  },
  isFetching: state => {
    return state.isFetching;
  },
  getRangeSummary: state => {
    return state.rangeSummary;
  },
  getPointSummary: state => {
    return state.pointSummary;
  },
  isChartZoomed: state => {
    return state.isChartZoomed;
  },
  isPointHovered: state => {
    return state.isPointHovered;
  },
  getSelectedStartDate: state => {
    return state.selectedDates.start;
  },
  getSelectedEndDate: state => {
    return state.selectedDates.end;
  },
  getDataEndDate: state => {
    return state.dataEndDate;
  },
  getExportData: state => {
    return state.exportData.data;
  },
  getExportName: state => {
    return `${formatDateForExport(state.selectedDates.end)} ${state.exportData.name}`;
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
    const filtered = dataFilter(data.data, data.start, data.end);
    const summary = getSummary(state.domains, filtered);
    commit('updateRangeSummary', summary);
  },
  generatePointSummary({ commit, state }, data) {
    const summary = getPointSummary(state.domains, data.date, data.dataContext);
    commit('updatePointSummary', summary);
  },
  saveSelectedDates({ commit, state }, data) {
    commit('updateSelectedDates', data);
  },
  setChartZoomed({ commit, state }, data) {
    commit('updateIsChartZoomed', data);
  },
  showInstantaneousData({ commit, state }, data) {
    commit('updateIsPointHovered', data);
  },
  setDataEndDate({ commit, state }, data) {
    commit('updateDataEndDate', data);
  },
  setExportData({ commit, state }, data) {
    commit('updateExportData', data);
  },
};

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
});

export default store;
