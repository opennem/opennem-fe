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
  exportData: [],
  exportRegion: null,
  exportPng: false,
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
  updateExportRegion(state, data) {
    state.exportRegion = data;
  },
  updateExportPng(state, data) {
    state.exportPng = data;
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
    return state.exportData;
  },
  getExportRegion: state => {
    return state.exportRegion;
  },
  getExportName: state => {
    return `${formatDateForExport(state.selectedDates.end)} ${state.exportRegion}`;
  },
  isExportPng: state => {
    return state.exportPng;
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
  setExportRegion({ commit, state }, data) {
    commit('updateExportRegion', data);
  },
  setExportPng({ commit, state }, data) {
    commit('updateExportPng', data);
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
    if (data === 'energy') {
      commit('showTemperaturePanel', false);
      commit('showPricePanel', false);
    }
    commit('updateVisType', data);
  },
};

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
});

export default store;
