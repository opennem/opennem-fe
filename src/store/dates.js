/* eslint-disable */
import { DateRanges } from '@/domains/date-ranges';
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  currentRange: DateRanges[1].id,
  currentYear: '',
  currentWeek: '',
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
  [MutationTypes.YEAR](state, data) {
    state.currentYear = data;
  },
  [MutationTypes.WEEK](state, data) {
    state.currentWeek = data;
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
  currentYearWeek: state => {
    return `_${state.currentYear}W${state.currentWeek}`;
  },
  hasCurrentYearWeek: state => {
    return state.currentYear && state.currentWeek;
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
  currentInterval({ commit, state }, data) {
    commit(MutationTypes.INTERVAL, data);
  },
  currentYear({ commit, state }, data) {
    commit(MutationTypes.YEAR, data);
  },
  currentWeek({ commit, state }, data) {
    commit(MutationTypes.WEEK, data);
  },
  saveSelectedDates({ commit, state }, data) {
    commit(MutationTypes.SELECTED_DATES, data);
  },
  setDataEndDate({ commit, state }, data) {
    commit(MutationTypes.DATA_END_DATE, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
