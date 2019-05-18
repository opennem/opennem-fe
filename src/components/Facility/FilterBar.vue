<template>
  <div class="facilities-options">
    <div class="filter-bar">
      <div class="filter-station">
        <button
          v-if="widthBreak"
          class="search-button button is-rounded is-small is-primary is-inverted"
          @click="toggleSearch">
          <font-awesome-icon v-if="searchOn" class="fal" :icon="iconClose" />
          <font-awesome-icon v-else class="fal" :icon="iconSearch" />
        </button>
        <input 
          v-if="!widthBreak || (searchOn && widthBreak)"
          class="input is-small is-rounded filter-station-input"
          type="text"
          placeholder="Filter By Station Name"
          autofill="off"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          v-model="filterFacilityName"
          @keyup="handleKeyup"
        />
      </div>

      <div 
        v-if="!searchOn"
        class="filter-tech dropdown"
        :class="{'is-active': techDropdownActive}" v-on-clickaway="onClickAway">
        <button
          class="dropdown-trigger button is-rounded is-small is-primary"
          :class="{ 'is-inverted': selectedTechGroups.length === 0 }"
          @click="techDropdownActive = !techDropdownActive"
        >
          <div class="dropdown-label">
            <strong>Technology</strong>
            <strong v-if="selectedTechGroups.length > 0">({{selectedTechGroups.length}})</strong>
          </div>
          <font-awesome-icon class="fal" :icon="iconDown" />
        </button>

        <transition name="slide-down-fade">
          <div v-if="techDropdownActive" class="dropdown-menu">
            <div class="dropdown-content">
              <div class="dropdown-item" v-for="(d, i) in allTechs" :key="i">

                <div class="item-group">
                  <span class="expand-collapse" @click="handleExpandCollapseClick(d.id)">
                    <font-awesome-icon class="fal fa-fw" v-if="d.fields.length > 1 && isGroupExpanded(d.id)" :icon="iconCaretDown" />
                    <font-awesome-icon class="fal fa-fw" v-if="d.fields.length > 1 && !isGroupExpanded(d.id)" :icon="iconCaretRight" />
                  </span>
                  <span @click="handleTechGroupClick(d)">
                    <span class="source-colour"
                      :style="{ 
                        backgroundColor: isGroupSelected(d.id) ? d.colour : '#fff',
                        'border-color': d.colour
                      }">
                        <font-awesome-icon v-if="hasSelection(d)" class="checkmark-icon fal" :icon="iconMinus" />
                        <font-awesome-icon v-else class="checkmark-icon fal" :icon="iconCheckmark" />
                      </span>
                    {{d.label}}
                  </span>
                </div>
                
                <div class="subitem-group" v-show="d.fields.length > 1 && isGroupExpanded(d.id)" >
                  <div v-for="(field, fIndex) in d.fields" :key="fIndex">
                    <span @click="handleTechClick(d, field)">
                      <span class="source-colour"
                        :style="{ 
                          backgroundColor: isTechSelected(field) ? getTechColour(field) : '#fff',
                          'border-color': getTechColour(field)
                        }"><font-awesome-icon class="checkmark-icon fal" :icon="iconCheckmark" /></span>
                      {{getTechLabel(field)}}
                    </span>
                  </div> 
                </div>
              </div>

              <div class="buttons">
                <a class="button is-rounded is-small is-inverted" @click="clearSelectedTechs">Clear</a>
                <a class="button is-rounded is-small is-primary is-outlined" @click="techDropdownActive = false">Close</a>
              </div>
            </div>
          </div>
        </transition> 
      </div>

      <filter-status
        v-if="!searchOn"
        class="filter-status"
        :selectedStatuses="selectedStatuses"
        @selectedStatuses="handleStatusesSelected"
      />
    </div>

    <!-- <view-toggle
      style="margin-top: 12px;"
      v-show="showToggle"
      @viewSelect="handleViewSelect"
    /> -->
  </div>  
</template>

<script>
import _ from 'lodash';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faAngleDown, faCheck, faCaretRight, faCaretDown, faMinus, faSearch, faTimes } from '@fortawesome/fontawesome-pro-light';
import { mixin as clickaway } from 'vue-clickaway';
import EventBus from '@/lib/event-bus';
import { GraphDomains } from '@/domains/graphs';
import Simplified from '@/domains/groups/simplified';
import FilterStatus from './FilterStatus';
import ViewToggle from './ViewToggle';

export default {
  mixins: [clickaway],
  components: {
    FontAwesomeIcon,
    FilterStatus,
    ViewToggle,
  },
  props: {
    selectedStatuses: Array,
    showToggle: Boolean,
  },
  data() {
    return {
      filterFacilityName: '',
      techDropdownActive: false,
      allTechs: [],
      selectedTechs: [],
      selectedTechGroups: [],
      groupExpanded: [],
      simplifiedGroup: _.cloneDeep(Simplified.groups),
      windowWidth: window.innerWidth,
      searchOn: false,
    };
  },
  computed: {
    iconDown() {
      return faAngleDown;
    },
    iconCheckmark() {
      return faCheck;
    },
    iconMinus() {
      return faMinus;
    },
    iconCaretRight() {
      return faCaretRight;
    },
    iconCaretDown() {
      return faCaretDown;
    },
    iconSearch() {
      return faSearch;
    },
    iconClose() {
      return faTimes;
    },
    widthBreak() {
      return this.windowWidth < 769;
    },
  },
  created() {
    this.selectedTechs = this.$store.getters.facilitySelectedTechs;
    window.addEventListener('resize', _.debounce(() => {
      this.windowWidth = window.innerWidth;
      // 769 tablet and up
    }, 200));
  },
  mounted() {
    EventBus.$on('facilities.filter.clear', this.clearFilter);

    const groups = this.simplifiedGroup.filter(g => (g.type === 'sources' && g.id !== 'imports') || g.id === 'pumps');
    const findSolarGroup = groups.find(g => g.id === 'group_solar');
    const findBatteryGroup = groups.find(g => g.id === 'group_battery_discharging');

    findSolarGroup.fields = ['solar']; // remove 'rooftop_solar'
    findBatteryGroup.label = 'Battery'; // rename battery discharging

    groups.forEach((g) => {
      this.allTechs.push(g);

      g.fields.forEach((f) => {
        if (_.includes(this.selectedTechs, f) &&
          !_.includes(this.selectedTechGroups, g.id)) {
          this.selectedTechGroups.push(g.id);
        }
      });
    });

    this.allTechs.reverse();
  },
  beforeDestroy() {
    EventBus.$off('facilities.filter.clear');
  },
  methods: {
    handleKeyup() {
      EventBus.$emit('facilities.name.filter', this.filterFacilityName);
    },
    onClickAway() {
      this.techDropdownActive = false;
    },
    toggleSearch() {
      this.searchOn = !this.searchOn
      if (!this.searchOn) {
        this.filterFacilityName = '';
        this.handleKeyup();
      }
    },
    isGroupSelected(groupId) {
      return _.includes(this.selectedTechGroups, groupId);
    },
    isTechSelected(techId) {
      return _.includes(this.selectedTechs, techId);
    },
    isGroupExpanded(groupId) {
      return _.includes(this.groupExpanded, groupId);
    },
    hasSelection(group) {
      const fieldsLength = group.fields.length;
      let fieldsSelected = 0;
      group.fields.forEach((f) => {
        if (_.includes(this.selectedTechs, f)) {
          fieldsSelected += 1;
        }
      });
      return fieldsSelected !== fieldsLength;
    },
    getTechLabel(techId) {
      return GraphDomains[techId].label;
    },
    getTechColour(techId) {
      return GraphDomains[techId].colour;
    },
    emitSelectedTechs() {
      this.$emit('selected', this.selectedTechs);
      this.$store.dispatch('facilitySelectedTechs', this.selectedTechs);
    },
    handleTechGroupClick(group) {
      const groupId = group.id;
      const isGroupIncluded = _.includes(this.selectedTechGroups, groupId);
      if (isGroupIncluded) {
        this.selectedTechGroups = this.selectedTechGroups.filter(d => d !== groupId);
        group.fields.forEach((f) => {
          this.selectedTechs = this.selectedTechs.filter(d => d !== f);
        });
      } else {
        this.selectedTechGroups.push(groupId);
        group.fields.forEach((f) => {
          this.selectedTechs.push(f);
        });
      }

      this.emitSelectedTechs();
    },
    handleTechClick(group, techId) {
      const isIncluded = _.includes(this.selectedTechs, techId);
      if (isIncluded) {
        this.selectedTechs = this.selectedTechs.filter(d => d !== techId);
      } else {
        this.selectedTechs.push(techId);
      }

      let fieldsSelected = 0;
      group.fields.forEach((f) => {
        if (_.includes(this.selectedTechs, f)) {
          fieldsSelected += 1;
        }
      });

      if (fieldsSelected === 0) {
        this.selectedTechGroups = this.selectedTechGroups.filter(d => d !== group.id);
      } else if (fieldsSelected !== 0) {
        const isGroupIncluded = _.includes(this.selectedTechGroups, group.id);
        if (!isGroupIncluded) {
          this.selectedTechGroups.push(group.id);
        }
      }

      this.emitSelectedTechs();
    },
    handleExpandCollapseClick(groupId) {
      const isIncluded = _.includes(this.groupExpanded, groupId);
      if (isIncluded) {
        this.groupExpanded = this.groupExpanded.filter(d => d !== groupId);
      } else {
        this.groupExpanded.push(groupId);
      }
    },
    clearSelectedTechs() {
      this.selectedTechGroups = [];
      this.selectedTechs = [];
      this.emitSelectedTechs();
    },
    clearFilter() {
      this.filterFacilityName = '';
    },
    handleStatusesSelected(selectedStatuses) {
      this.$emit('selectedStatuses', selectedStatuses);
    },
    handleViewSelect(view) {
      this.$emit('viewSelect', view);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

.facilities-options {
  width: 100%;
}
.dropdown-label {
  font-family: $primary-font-family;
  margin-right: 0.5rem;
  font-size: 12px;
  strong {
    font-weight: 600;
  }
}
.dropdown-menu {
  font-family: $primary-font-family;
  margin-left: 0.75rem;
  margin-top: 0.1rem;

  .dropdown-content {
    padding: 0.3rem 0;
  }

  .dropdown-item {
    font-size: 11px;
    padding: 0.25rem 0.4rem;
    cursor: pointer;
    user-select: none;
    
    .item-group {
      display: flex;
    }

    .subitem-group {
      margin: 4px 0 0;
      padding: 2px 19px;
      background-color: #efefef;
      box-shadow: inset 1px 1px 4px rgba(100, 100, 100, 0.1);
      border-radius: 2px;

      div {
        padding: 2px 0;
      }
    }
  }
}
.filter-bar {
  display: flex;
  margin: 5px 0 5px 10px;

  @include tablet {
    margin: 0;
  }

  .filter-station-input {
    width: 170px;
    
    @include tablet {
      width: 230px;
      margin-right: 10px;
    }
  }

  .filter-tech,
  .filter-status,
  .search-button {
    margin: 0 3px;
  }

  .buttons {
    border-top: 1px solid #eee;
    padding: 0.4rem 0.5rem 0.1rem;
    margin-top: 0.3rem;
    display: flex;
    justify-content: space-between;
    text-align: right;

    .button {
      font-size: 10px;
      margin-left: 0;
      margin-left: 0.7rem;
    }
  }
}
.expand-collapse {
  font-size: 13px;
  display: block;
  width: 19px;
  height: 15px;
  position: relative;
}
.source-colour {
  width: 15px;
  height: 15px;
  background-color: rgba(255,255,255,.8);
  display: inline-block;
  vertical-align: text-bottom;
  margin-right: 0.4rem;
  position: relative;
  top: 1px;
  border: 1px solid #000;
  border-radius: 1px;

  .checkmark-icon {
    position: relative;
    left: 2px;
    bottom: 1px;
    color: #fff;
  }
}
</style>
