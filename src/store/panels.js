/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';

const panelsSelection = [
  {
    id: 'priceTemperature',
    label: 'Price & Temperature',
  },
  {
    id: 'emissionVolumeIntensity',
    label: 'Emission Volume & Intensity',
  },
];

const state = {
  showTemperaturePanel: true,
  showPricePanel: true,
  showSummaryPanel: false,
  showEmissionVolumePanel: false,
  showEmissionIntensityPanel: false,
  panelsSelection,
  panelsSelected: panelsSelection[0],
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
  [MutationTypes.EMISSION_VOLUME_PANEL](state, data) {
    state.showEmissionVolumePanel = data;
  },
  [MutationTypes.EMISSION_INTENSITY_PANEL](state, data) {
    state.showEmissionIntensityPanel = data;
  },
  [MutationTypes.PANELS_SELECTIONS](state, data) {
    state.panelsSelection = data;
  },
  [MutationTypes.PANELS_SELECTED](state, data) {
    state.panelsSelected = data;
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
  showEmissionVolumePanel: state => {
    return state.showEmissionVolumePanel;
  },
  showEmissionIntensityPanel: state => {
    return state.showEmissionIntensityPanel;
  },
  panelsSelection: state => {
    return state.panelsSelection;
  },
  panelsSelected: state => {
    return state.panelsSelected;
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
  showEmissionVolumePanel({ commit, state }, data) {
    commit(MutationTypes.EMISSION_VOLUME_PANEL, data);
  },
  showEmissionIntensityPanel({ commit, state }, data) {
    commit(MutationTypes.EMISSION_INTENSITY_PANEL, data);
  },
  panelsSelection({ commit, state }, data) {
    commit(MutationTypes.PANELS_SELECTIONS, data);
  },
  panelsSelected({ commit, state }, data) {
    commit(MutationTypes.PANELS_SELECTED, data);
  },
  resetPanelsSelected({ commit, state }) {
    commit(MutationTypes.PANELS_SELECTED, panelsSelection[0]);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
