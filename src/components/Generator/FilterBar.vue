<template>
  <div class="filter-bar">
    <input 
      class="input is-small is-rounded filter-station-input"
      type="text"
      placeholder="Filter By Station Name"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      v-model="filterGeneratorName"
    />

    <div class="dropdown" :class="{'is-active': techDropdownActive}" v-on-clickaway="onClickAway">
      <button
        class="dropdown-trigger button is-rounded is-small is-primary"
        :class="{ 'is-inverted': selectedTechGroups.length === 0 }"
        @click="techDropdownActive = true"
      >
        <div class="dropdown-label">
          <span>Technology</span>
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

    <button class="button is-rounded is-small is-primary is-inverted">Status</button>
  </div>  
</template>

<script>
import _ from 'lodash';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faAngleDown, faCheck, faCaretRight, faCaretDown, faMinus } from '@fortawesome/fontawesome-pro-light';
import { mixin as clickaway } from 'vue-clickaway';
import EventBus from '@/lib/event-bus';
import { GraphDomains } from '@/domains/graphs';
import Simplified from '@/domains/groups/simplified';

export default {
  mixins: [clickaway],
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      filterGeneratorName: '',
      techDropdownActive: false,
      allTechs: [],
      selectedTechs: [],
      selectedTechGroups: [],
      groupExpanded: [],
      simplifiedGroup: _.cloneDeep(Simplified.groups),
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
  },
  watch: {
    filterGeneratorName(string) {
      EventBus.$emit('generators.name.filter', string);
    },
  },
  created() {
    this.selectedTechs = this.$store.getters.generatorsSelectedTechs;
  },
  mounted() {
    EventBus.$on('generators.filter.clear', this.clearFilter);

    const groups = this.simplifiedGroup.filter(g => g.type === 'sources' && g.id !== 'imports');
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
    EventBus.$off('generators.filter.clear');
  },
  methods: {
    onClickAway() {
      this.techDropdownActive = false;
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
      this.$store.dispatch('generatorsSelectedTechs', this.selectedTechs);
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
      this.filterGeneratorName = '';
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

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
  padding: 1rem 1rem 0;
  display: flex;

  .filter-station-input {
    width: 200px;
  }
  .button {
    margin-left: 0.7rem;
  }
  .dropdown-label {
    margin-right: 0.5rem;
    strong {
      font-size: 11px;
      font-weight: 400;
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
    bottom: 0;
    color: #fff;
  }
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
  }
}
</style>
