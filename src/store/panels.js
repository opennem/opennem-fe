/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const state = {
  showTemperaturePanel: true,
  showPricePanel: true,
  showSummaryPanel: false,
};

const mutations = {
  [MutationTypes.TEMPERATURE_PANEL](state, data) {
    state.showTemperaturePanel = data;
  },
  [MutationTypes.PRICE_PANEL](state, data) {
    state.showPricePanel = data;
  },
  [MutationTypes.SUMMARY_PANEL](state, data) {
    state.showSummaryPanel = data;
  },
};

const getters = {
  showTemperaturePanel: state => {
    return state.showTemperaturePanel;
  },
  showPricePanel: state => {
    return state.showPricePanel;
  },
  showSummaryPanel: state => {
    return state.showSummaryPanel;
  },
};

const actions = {
  setTemperaturePanel({ commit, state }, data) {
    commit(MutationTypes.TEMPERATURE_PANEL, data);
  },
  setPricePanel({ commit, state }, data) {
    commit(MutationTypes.PRICE_PANEL, data);
  },
  setSummaryPanel({ commit, state }, data) {
    commit(MutationTypes.SUMMARY_PANEL, data);
  },
  resetPanels({ commit, state }) {
    commit(MutationTypes.TEMPERATURE_PANEL, true);
    commit(MutationTypes.PRICE_PANEL, true);
    commit(MutationTypes.SUMMARY_PANEL, false);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
