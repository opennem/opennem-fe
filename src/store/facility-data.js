/* eslint-disable */
import _ from 'lodash';
import getJSON from '@/lib/data-apis';
import * as MutationTypes from '@/constants/mutation-types';
import { GraphDomains } from '@/domains/graphs';

function transformFacilityData(data) {
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
    const genFuelTechs = [];
    const loadFuelTechs = [];
    const fuelTechRegisteredCap = {};
    const displayName = d.display_name.split('/').join(' / ');
    let generatorCap = 0;

    duidKeys.forEach(unitName => {
      const unit = d.duid_data[unitName];
      const regCap = unit.registered_capacity;
      const fuelTech = unit.fuel_tech;
      const type = GraphDomains[fuelTech] ? GraphDomains[fuelTech].type : '';

      const unitObj = {
        name: unitName,
        fuelTech,
        regCap,
        type,
      };

      if (type === 'sources') {
        generatorCap += regCap || 0;
      }

      if (fuelTech) {
        if (!fuelTechRegisteredCap[fuelTech]) {
          fuelTechRegisteredCap[fuelTech] = 0;
        }
        fuelTechRegisteredCap[fuelTech] += regCap;
      }

      if (fuelTech !== 'battery_charging' && !_.isEmpty(unit)) {
        fuelTechs.push(fuelTech);
        if (type === 'sources') {
          genFuelTechs.push(fuelTech);
        } else if (type === 'loads') {
          loadFuelTechs.push(fuelTech);
        }
      }

      if (!_.isEmpty(unit)) {
        units.push(unitObj);
      }
    });

    return {
      stationId,
      displayName,
      status: d.status.state,
      statusDate: d.status.date,
      regionId,
      location,
      units,
      generatorCap,
      unitNum,
      fuelTechs: _.uniq(fuelTechs).sort(),
      genFuelTechs: _.uniq(genFuelTechs).sort(),
      loadFuelTechs: _.uniq(loadFuelTechs).sort(),
      fuelTechRegisteredCap,
    }
  })
}

const state = {
  facilityData: [],
  facilityResponseData: [],
  facilityExportData: [],
  facilitySelectedTechs: [],
  facilityView: 'list', // map, list
};

const mutations = {
  [MutationTypes.FACILITY_DATA](state, data) {
    state.facilityData = data;
  },
  [MutationTypes.FACILITY_RESPONSE_DATA](state, data) {
    state.facilityResponseData = data;
  },
  [MutationTypes.FACILITY_EXPORT_DATA](state, data) {
    state.facilityExportData = data;
  },
  [MutationTypes.FACILITY_SELECTED_TECHS](state, data) {
    state.facilitySelectedTechs = data;
  },
  [MutationTypes.FACILITY_VIEW](state, data) {
    state.facilityView = data;
  },
};

const getters = {
  facilityData: state => {
    return state.facilityData;
  },
  facilityResponseData: state => {
    return state.facilityResponseData;
  },
  facilityExportData: state => {
    return state.facilityExportData;
  },
  facilitySelectedTechs: state => {
    return state.facilitySelectedTechs;
  },
  facilityView: state => {
    return state.facilityView;
  },
};

const actions = {
  fetchFacilityData({ commit, state }) {
    // test_facility_registry.json
    // const urls = ['facility/facility_registry.json'];
    const urls = ['facility/test_facility_registry.json'];

    getJSON(urls, false)
      .then((responses) => {
        const transformedData = transformFacilityData(responses[0].data);
        commit(MutationTypes.FACILITY_DATA, transformedData);
      })
      .catch((e) => {
        // handleFetchError(e, commit);
      });
  },
  facilityResponseData({ commit, state }, data) {
    commit(MutationTypes.FACILITY_RESPONSE_DATA, data);
  },
  facilityExportData({ commit, state }, data) {
    commit(MutationTypes.FACILITY_EXPORT_DATA, data);
  },
  facilitySelectedTechs({ commit, state }, data) {
    commit(MutationTypes.FACILITY_SELECTED_TECHS, data);
  },
  facilityView({ commit, state }, data) {
    commit(MutationTypes.FACILITY_VIEW, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
