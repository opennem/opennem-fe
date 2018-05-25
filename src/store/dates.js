/* eslint-disable */
import { DateRanges } from '@/domains/date-ranges';
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  currentRange: DateRanges[1].id,
  years: [],
  weeks: [],
  currentInterval: '',
  selectedDates: {
    start: null,
    end: null,
  },
  dataEndDate: null,
};

const mutations = {
  [MutationTypes.RANGE](state, data) {
    state.currentRange = data;
  },
  [MutationTypes.YEARS](state, data) {
    state.years = data;
  },
  [MutationTypes.WEEKS](state, data) {
    state.weeks = data;
  },
  [MutationTypes.INTERVAL](state, data) {
    state.currentInterval = data;
  },
  [MutationTypes.SELECTED_DATES](state, data) {
    state.selectedDates = data;
  },
  [MutationTypes.DATA_END_DATE](state, data) {
    state.dataEndDate = data;
  },
};

const getters = {
  currentRange: state => {
    return state.currentRange;
  },
  currentInterval: state => {
    return state.currentInterval;
  },
  hasInterval: state => {
    return state.currentInterval;
  },
  yearsWeeks: state => {
    return state.weeks.map((week, index) => getYearWeekString(state.years[index], week));
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
};

const actions = {
  currentRange({ commit, state }, data) {
    commit(MutationTypes.RANGE, data);
  },
  years({ commit, state }, data) {
    commit(MutationTypes.YEARS, data);
  },
  weeks({ commit, state }, data) {
    commit(MutationTypes.WEEKS, data);
  },
  currentInterval({ commit, state }, data) {
    commit(MutationTypes.INTERVAL, data);
  },
  saveSelectedDates({ commit, state }, data) {
    commit(MutationTypes.SELECTED_DATES, data);
  },
  setDataEndDate({ commit, state }, data) {
    commit(MutationTypes.DATA_END_DATE, data);
  },
};

function getYearWeekString(year, week) {
  return `_${year}W${week}`;
}

export default {
  state,
  mutations,
  getters,
  actions,
};
