/* eslint-disable */
import * as MutationTypes from './mutation-types';

const state = {
  selectedDates: {
    start: null,
    end: null,
  },
  dataEndDate: null,
};

const mutations = {
  [MutationTypes.SELECTED_DATES](state, data) {
    state.selectedDates = data;
  },
  [MutationTypes.DATA_END_DATE](state, data) {
    state.dataEndDate = data;
  },
};

const getters = {
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
