/* eslint-disable */
import * as MutationTypes from '@/constants/mutation-types';
import SourceGroups from '@/domains/groups';

const state = {
  groupSelections: SourceGroups,
  groupSelected: SourceGroups[0],
};

const mutations = {
  [MutationTypes.GROUP_SELECTIONS](state, data) {
    state.groupSelections = data;
  },
  [MutationTypes.GROUP_SELECTED](state, data) {
    state.groupSelected = data;
  },
};

const getters = {
  groupSelections: state => {
    return state.groupSelections;
  },
  groupSelected: state => {
    return state.groupSelected;
  },
};

const actions = {
  groupSelections({ commit, state }, data) {
    commit(MutationTypes.GROUP_SELECTIONS, data);
  },
  groupSelected({ commit, state }, data) {
    commit(MutationTypes.GROUP_SELECTED, data);
  },
};

export default {
  state,
  mutations,
  getters,
  actions,
};
