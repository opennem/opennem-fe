/* eslint-disable */
import { DateRanges } from '@/domains/date-ranges';
import { isMobileWidth } from '@/lib/browser';
import * as MutationTypes from './mutation-types';

const defaultRange = isMobileWidth() ? DateRanges[1].id : DateRanges[2].id;
const state = {
  currentRange: defaultRange,
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
