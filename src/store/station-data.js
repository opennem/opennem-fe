/* eslint-disable */
import _ from 'lodash';
import getJSON from '@/lib/data-apis';
import * as MutationTypes from '@/constants/mutation-types';

function transformStationData(d) {
  const stationId = d.station_id || '';
  const regionId = d.region_id || '';
  const location = d.location || null;
  const units = [];
  const duidKeys = Object.keys(d.duid_data);
  const unitNum = duidKeys.length;
  const fuelTechs = [];
  let generatorCap = 0;

  duidKeys.forEach(unitName => {
    const unit = d.duid_data[unitName];
    const regCap = unit.registered_capacity;
    const fuelTech = unit.fuel_tech;
    const startType = unit.start_type;
    const scheduleType = unit.schedule_type;
    const dispatchType = unit.dispatch_type;

    const unitObj = {
      name: unitName,
      fuelTech,
      regCap,
      firstRun: unit.first_run,
      dispatchType,
      scheduleType,
      startType,
      maxCap: unit.max_capacity,
      npi: unit.npi
        ? { reportYear: unit.npi.report_year, unit: unit.npi.unit, data: unit.npi.data }
        : null,
    };

    if (
      (startType && startType !== 'not dispatched') ||
      (scheduleType && scheduleType !== 'non-scheduled')
    ) {
      generatorCap += regCap || 0;
    }
    if (dispatchType === 'generator') {
      fuelTechs.push(fuelTech);
    }
    units.push(unitObj);
  });

  return {
    stationId,
    stationName: d.station_name,
    displayName: d.display_name,
    participant: d.participant,
    status: d.status.state,
    statusDate: d.status.date,
    regionId,
    location,
    units,
    generatorCap,
    unitNum,
    fuelTechs: _.uniq(fuelTechs),
  }
}

const state = {
  stationData: {},
};

const mutations = {
  [MutationTypes.STATION_DATA](state, data) {
    state.stationData = data;
  },
};

const getters = {
  stationData: state => {
    return state.stationData;
  },
};

const actions = {
  fetchStationData({ commit, state }, stationId) {
    const urls = [`station/${stationId}.json`];

    getJSON(urls, false)
      .then((responses) => {
        console.log(responses[0].data)
        const transformedData = transformStationData(responses[0].data);
        commit(MutationTypes.STATION_DATA, transformedData);
      })
      .catch((e) => {
        // handleFetchError(e, commit);
      });
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
