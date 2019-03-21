/* eslint-disable */
import Vue from 'vue';
import Vuex from 'vuex';
import * as moment from 'moment';

import { getSummary, getPointSummary, getGroupPointSummary } from '@/lib/data-summary';
import { dataFilter, dataFilterByLastValuePrecision } from '@/lib/data-helpers';
import dataTransform from '@/lib/data-transform';
import getJSON from '@/lib/data-apis';
import { formatDateForExport } from '@/lib/formatter';
import { isLast24Hrs, isLast3Days } from '@/domains/date-ranges';
import { GraphDomains } from '@/domains/graphs';
import fYTimeGroup from '@/modules/fy-time-group';
import yearlyTimeGroup from '@/modules/yearly-time-group';
import seasonsTimeGroup from '@/modules/seasons-time-group';
import quarterlyTimeGroup from '@/modules/quarterly-time-group';
import y1WeekTimeGroup from '@/modules/y1-week-time-group';
import y1MonthTimeGroup from '@/modules/y1-month-time-group';
import thirtyMinTimeGroup from '@/modules/thirty-min-time-group';
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
import generatorsData from './generators-data';

import groups from './groups';

Vue.use(Vuex);

const state = {
  region: 'nem',
  domains: {},
  domainGroups: {},
  useGroups: false,
  isFetching: false,
  visType: VisTypes.VIS_TYPE_POWER,
};

const mutations = {
  [MutationTypes.REGION](state, data) {
    state.region = data;
  },
  [MutationTypes.DOMAINS](state, data) {
    state.domains = data;
  },
  [MutationTypes.DOMAIN_GROUPS](state, data) {
    state.domainGroups = data;
  },
  [MutationTypes.USE_GROUPS](state, data) {
    state.useGroups = data;
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
  region: state => {
    return state.region;
  },
  getDomains: state => {
    return state.domains;
  },
  domainGroups: state => {
    return state.domainGroups;
  },
  useGroups: state => {
    return state.useGroups;
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
    const currentRange = state.dates.currentRange;
    let formatString = 'YYYYMMDD';
    if (currentRange === 'allMonthly' || currentRange === 'lastYear') {
      formatString = 'YYYY';
    }
    return `${formatDateForExport(state.dates.selectedDates.end, formatString)} ${state.exportStore.exportRegion}`;
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

  region({ commit, state }, data) {
    commit(MutationTypes.REGION, data);
  },

  generateGroupedNemData({ commit, state }) {
    const nemData = state.nemData.nemData;
    const group = state.groups.groupSelected;
    const groupedNemData = [];

    nemData.forEach((d) => {
      const newD = {
        date: d.date,
      };

      group.groups.forEach((g) => {
        let newValue = 0;
        g.fields.forEach((f) => {
          newValue += d[f] || 0;
        });

        if ((g.type === 'temperature' ||
          g.id === 'pricePos' ||
          g.id === 'priceNeg') && newValue === 0) {
          newValue = null;
        }

        newD[g.id] = newValue;
      });

      groupedNemData.push(newD);
    });

    commit(MutationTypes.GROUPED_NEM_DATA, groupedNemData);
  },

  setDomains({ commit, state }, data) {
    commit(MutationTypes.DOMAINS, data);
  },
  domainGroups({ commit, state }, data) {
    commit(MutationTypes.DOMAIN_GROUPS, data);
  },
  useGroups({ commit, state }, data) {
    commit(MutationTypes.USE_GROUPS, data);
  },
  fetchingData({ commit, state }, data) {
    commit(MutationTypes.FETCHING, data);
  },
  generateRangeSummary({ commit, state }, data) {
    const isPower = state.visType === VisTypes.VIS_TYPE_POWER;
    const isTera = state.nemData.tera;
    const filtered = dataFilter(data.data, data.start, data.end);
    const summary = getSummary(state.domains, filtered, isPower, isTera);
    commit(MutationTypes.RANGE_SUMMARY, summary);
  },
  generatePointSummary({ commit, state }, data) {
    const isTera = state.nemData.tera;
    const summary = state.useGroups ?
      getGroupPointSummary(state.domainGroups, data.date, data.dataContext, state.visType, isTera) :
      getPointSummary(state.domains, data.date, data.dataContext, state.visType);
    commit(MutationTypes.POINT_SUMMARY, summary);
  },
  generateExportData({ commit, state }) {
    const responses = state.nemData.responseData;
    let exportData = [];
    responses.forEach((r) => {
      exportData = [...exportData, ...dataTransform(state.domains, r.data, false)];
    });

    let endDateFilter = state.dates.selectedDates.end
    switch (state.dates.currentInterval) {
      case 'WW':
        endDateFilter = moment(state.dates.selectedDates.end).add(1, 'week').toDate()
        break;

      case 'MM':
        endDateFilter = moment(state.dates.selectedDates.end).add(1, 'month').toDate()
        break;

      case '3MM':
      case 'S3MM':
        endDateFilter = moment(state.dates.selectedDates.end).add(2, 'months').toDate()
        break;

      case 'YYYY':
      case 'FY':
          endDateFilter = moment(state.dates.selectedDates.end).add(1, 'year').toDate()
          break;
      
      default:
    }

    if (state.dates.selectedDates.start && endDateFilter) {
      exportData = dataFilter(exportData, state.dates.selectedDates.start, endDateFilter);
    }
  
    commit(MutationTypes.EXPORT_DATA, exportData);
  },
  setVisType({ commit, state }, data) {
    commit(MutationTypes.VIS_TYPE, data);
  },
};

function convertToTera(data) {
  data.forEach(d => {
    Object.keys(d).forEach(k => {
      const graphKey = GraphDomains[k];
      if (graphKey &&
        (graphKey.type === 'sources' || graphKey.type === 'loads')
      ) {
        if (d[k]) {
          d[k] = d[k] / 1000;
        }
      }
    })
  })
}

function handleFetchResponse(responses, state, commit) {
  let data = [];
  let useTera = false;

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

  if (state.dates.currentInterval === '30mm') {
    data = thirtyMinTimeGroup(data);
  }

  if (state.dates.currentRange === 'allMonthly') {
    if (state.dates.currentInterval === 'MM') {
      data = y1MonthTimeGroup(data);
    } else if (state.dates.currentInterval === 'FY') {
      data = fYTimeGroup(data);
      convertToTera(data);
      useTera = true;
    } else if (state.dates.currentInterval === 'S3MM') {
      data = seasonsTimeGroup(data);
    } else if (state.dates.currentInterval === '3MM') {
      data = quarterlyTimeGroup(data);
    } else if (state.dates.currentInterval === 'YYYY') {
      data = yearlyTimeGroup(data);
      convertToTera(data);
      useTera = true;
    }
  
  }

  if (state.dates.currentRange === 'lastYear') {
    if (state.dates.currentInterval === 'WW') {
      data = y1WeekTimeGroup(data);
    } else if (state.dates.currentInterval === 'MM') {
      data = y1MonthTimeGroup(data);
    }
  }

  // if (state.dates.currentRange === 'lastYear' && state.dates.currentInterval === 'DD') {
  //   data = dataFilter(data, moment().subtract(1, 'year').toDate(), moment().toDate());
  // }

  if (state.nemData.nemTrim) {
    data = dataFilter(data, state.nemData.nemDataTrim.start, state.nemData.nemDataTrim.end);
  }

  const first = data[0];
  let hasWarning = false;

  if (moment(first.date).isBefore('2017-01-01')) {
    if (state.dates.currentRange !== 'allMonthly' &&
      (state.dates.currentRange === 'lastYear' &&
        state.dates.currentInterval !== 'MM')) {
      hasWarning = true;
    }
  }

  commit(MutationTypes.NEM_TERA, useTera);
  commit(MutationTypes.WARNING, hasWarning);
  commit(MutationTypes.NEM_RESPONSE_DATA, responses);
  commit(MutationTypes.NEM_DATA, data);
  commit(MutationTypes.DATA_END_DATE, endDate);
}

function handleFetchError(e, commit) {
  const requestUrl = e.config ? `${e.config.url},` : '';
  const message = e.message === 'Network Error' ?
    'No \'Access-Control-Allow-Origin\' header is present on the requested resource' :
    'Data not yet available.';

  commit(MutationTypes.FETCHING, false);
  commit(MutationTypes.ERROR, true);
  // commit(MutationTypes.ERROR_MESSAGE, `${requestUrl} Error: ${message}`);
  commit(MutationTypes.ERROR_MESSAGE, message);
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
    generatorsData,
    groups,
  }
});

export default store;
