/* eslint-disable */
import Vue from 'vue';
import Vuex from 'vuex';
import { getSummary, getPointSummary } from '@/lib/data-summary';
import { dataFilter } from '@/lib/data-helpers';
import dataTransform from '@/lib/data-transform';
import getJSON from '@/lib/data-apis';
import { formatDateForExport } from '@/lib/formatter';
import { DateRanges, isLast24Hrs } from '@/domains/date-ranges';
import * as MutationTypes from '@/constants/mutation-types';
import * as VisTypes from '@/constants/vis-types';

import nemData from './nem-data';
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
  isChartZoomed: false,
  visType: VisTypes.VIS_TYPE_POWER,
  groupToPeriods: DateRanges[1].groupToPeriods,
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
  [MutationTypes.CHART_ZOOMED](state, data) {
    state.isChartZoomed = data;
  },
  [MutationTypes.VIS_TYPE](state, data) {
    state.visType = data;
  },
  [MutationTypes.GROUP_TO_PERIODS](state, data) {
    state.groupToPeriods = data;
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
  visType: state => {
    return state.visType;
  },
  groupToPeriods: state => {
    return state.groupToPeriods;
  },
  isPower: state => {
    return state.visType === VisTypes.VIS_TYPE_POWER;
  },
  getExportName: state => {
    return `${formatDateForExport(state.dates.selectedDates.end)} ${state.exportStore.exportRegion}`;
  },
};

const actions = {
  fetchNemData({ commit, state }, url) {
    commit(MutationTypes.FETCHING, true);
    commit(MutationTypes.ERROR, false);
    commit(MutationTypes.ERROR_MESSAGE, '');

    getJSON(url, state.features.externalData)
      .then((response) => {
        if (response.status === 200) {
          handleFetchResponse(response, state, commit);
        } else {
          throw response.originalError;
        }
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
  setChartZoomed({ commit, state }, data) {
    commit(MutationTypes.CHART_ZOOMED, data);
  },
  setVisType({ commit, state }, data) {
    commit(MutationTypes.VIS_TYPE, data);
  },
  groupToPeriods({ commit, state }, data) {
    commit(MutationTypes.GROUP_TO_PERIODS, data);
  },
};

function handleFetchResponse(response, state, commit) {
  let data = dataTransform(state.domains, response.data);
  const endIndex = data.length - 1;
  const endDate = data[endIndex].date;

  if (isLast24Hrs(state.dates.currentRange)) {
    const startIndex = data.length - 289;
    const startDate = data[startIndex].date;
    data = dataFilter(data, startDate, endDate);
  }

  commit(MutationTypes.NEM_DATA, data);
  commit(MutationTypes.DATA_END_DATE, endDate);
  commit(MutationTypes.EXPORT_DATA, data);
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
    exportStore,
    summary,
    dates,
    panels,
    features,
    errors,
  }
});

export default store;
