/* eslint-disable */
import _ from 'lodash';
import getJSON from '@/lib/data-apis';
import * as MutationTypes from '@/constants/mutation-types';

function transformGeneratorData(data) {
  const stationIds = Object.keys(data);
  const stations = stationIds.map(d => data[d]);

  return stations.map(d => {
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

      const unitObj = {
        name: unitName,
        fuelTech,
        regCap,
      };

      generatorCap += regCap || 0;
      if (fuelTech !== 'battery_charging') {
        fuelTechs.push(fuelTech);
      }
      units.push(unitObj);
    });

    return {
      stationId,
      displayName: d.display_name,
      status: d.status.state,
      statusDate: d.status.date,
      regionId,
      location,
      units,
      generatorCap,
      unitNum,
      fuelTechs: _.uniq(fuelTechs),
    }
  })
}

const state = {
  generatorsData: [],
  generatorsResponseData: [],
  generatorsSelectedTechs: [],
};

const mutations = {
  [MutationTypes.GENERATORS_DATA](state, data) {
    state.generatorsData = data;
  },
  [MutationTypes.GENERATORS_RESPONSE_DATA](state, data) {
    state.generatorsResponseData = data;
  },
  [MutationTypes.GENERATORS_SELECTED_TECHS](state, data) {
    state.generatorsSelectedTechs = data;
  },
};

const getters = {
  generatorsData: state => {
    return state.generatorsData;
  },
  generatorsResponseData: state => {
    return state.generatorsResponseData;
  },
  generatorsSelectedTechs: state => {
    return state.generatorsSelectedTechs;
  },
};

const actions = {
  fetchGeneratorsData({ commit, state }) {
    const urls = ['station/generator_registry.json'];
    // const urls = ['facility/facility_registry.json'];

    getJSON(urls, false)
      .then((responses) => {
        console.log(responses[0].data)
        const transformedData = transformGeneratorData(responses[0].data);
        commit(MutationTypes.GENERATORS_DATA, transformedData);
      })
      .catch((e) => {
        // handleFetchError(e, commit);
      });
  },
  generatorsResponseData({ commit, state }, data) {
    commit(MutationTypes.GENERATORS_RESPONSE_DATA, data);
  },
  generatorsSelectedTechs({ commit, state }, data) {
    commit(MutationTypes.GENERATORS_SELECTED_TECHS, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
