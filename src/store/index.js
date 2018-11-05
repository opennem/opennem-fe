/* eslint-disable */
import Vue from 'vue';
import Vuex from 'vuex';
import { getSummary, getPointSummary } from '@/lib/data-summary';
import { dataFilter, dataFilterByLastValuePrecision } from '@/lib/data-helpers';
import dataTransform from '@/lib/data-transform';
import getJSON from '@/lib/data-apis';
import { formatDateForExport } from '@/lib/formatter';
import { isLast24Hrs, isLast3Days } from '@/domains/date-ranges';
import * as MutationTypes from '@/constants/mutation-types';
import * as VisTypes from '@/constants/vis-types';

import nemData from './nem-data';
import chartOptions from './chart-options';
import exportStore from './export';
import summary from './summary';
import dates from './dates';
import panels from './panels';
import features from './features';
import errors from './errors';

Vue.use(Vuex);

const state = {
  domains: {},
  isFetching: false,
  visType: VisTypes.VIS_TYPE_POWER,
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
  [MutationTypes.VIS_TYPE](state, data) {
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
  visType: state => {
    return state.visType;
  },
  isPower: state => {
    return state.visType === VisTypes.VIS_TYPE_POWER;
  },
  getExportName: state => {
    return `${formatDateForExport(state.dates.selectedDates.end)} ${state.exportStore.exportRegion}`;
  },
};

const actions = {
  fetchData({ commit, state }, urls) {
    commit(MutationTypes.FETCHING, true);
    commit(MutationTypes.ERROR, false);
    commit(MutationTypes.ERROR_MESSAGE, '');

    getJSON(urls, state.features.localData)
      .then((responses) => {
        handleFetchResponse(responses, state, commit);
      })
      .catch((e) => {
        handleFetchError(e, commit);
      });
  },
  setDomains({ commit, state }, data) {
    commit(MutationTypes.DOMAINS, data);
  },
  fetchingData({ commit, state }, data) {
    commit(MutationTypes.FETCHING, data);
  },
  generateRangeSummary({ commit, state }, data) {
    const isPower = state.visType === VisTypes.VIS_TYPE_POWER;
    const filtered = dataFilter(data.data, data.start, data.end);
    const summary = getSummary(state.domains, filtered, isPower);
    commit(MutationTypes.RANGE_SUMMARY, summary);
  },
  generatePointSummary({ commit, state }, data) {
    const summary = getPointSummary(state.domains, data.date, data.dataContext);
    commit(MutationTypes.POINT_SUMMARY, summary);
  },
  generateExportData({ commit, state }, data) {
    const responses = state.nemData.responseData;
    let exportData = [];

    responses.forEach((r) => {
      exportData = [...exportData, ...dataTransform(state.domains, r.data, false)];
    });

    exportData = dataFilter(exportData, state.dates.selectedDates.start, state.dates.selectedDates.end);

    commit(MutationTypes.EXPORT_DATA, exportData);
  },
  setVisType({ commit, state }, data) {
    commit(MutationTypes.VIS_TYPE, data);
  },
};

function handleFetchResponse(responses, state, commit) {
  let data = [];

  responses.forEach((r) => {
    data = [...data, ...dataTransform(state.domains, r.data, true)];
  })

  const endIndex = data.length - 1;
  const endDate = data[endIndex].date;

  if (isLast24Hrs(state.dates.currentRange)) {
    data = dataFilterByLastValuePrecision(data, '24', 'hour');
  } else if (isLast3Days(state.dates.currentRange)) {
    data = dataFilterByLastValuePrecision(data, '3', 'day');
  }

  commit(MutationTypes.NEM_RESPONSE_DATA, responses);
  commit(MutationTypes.NEM_DATA, data);
  commit(MutationTypes.DATA_END_DATE, endDate);
}

function handleFetchError(e, commit) {
  const requestUrl = e.config ? `${e.config.url},` : '';
  const message = e.message === 'Network Error' ?
    'No \'Access-Control-Allow-Origin\' header is present on the requested resource' :
    e.message;

  commit(MutationTypes.FETCHING, false);
  commit(MutationTypes.ERROR, true);
  commit(MutationTypes.ERROR_MESSAGE, `${requestUrl} Error: ${message}`);
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  modules: {
    nemData,
    chartOptions,
    exportStore,
    summary,
    dates,
    panels,
    features,
    errors,
  }
});

export default store;
