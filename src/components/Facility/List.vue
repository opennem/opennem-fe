<template>
  <div style="margin-bottom: 1rem;">
    <div class="column-headers">
      <div 
        class="col-header" 
        style="width: 50%; margin-left: 2rem;"
        @click="sort('displayName')"
      >
        Name
        <font-awesome-icon
          class="fal"
          v-if="sortBy === 'displayName'"
          :icon="getColumnIcon('displayName')"
        />
      </div>

      <div 
        class="col-header" 
        style="width: 130px"
        v-show="!hideRegionColumn"
      >
        <span @click="sort('regionId')">
          Region
          <font-awesome-icon
            class="fal"
            v-if="sortBy === 'regionId'"
            :icon="getColumnIcon('regionId')"
          />
        </span>
      </div>

      <div 
        class="col-header" 
        :style="{ width: hideRegionColumn ? '205px' : '185px'}"
      >
        <span @click="sort('fuelTechs')">
          Technology
          <font-awesome-icon
            class="fal"
            v-if="sortBy === 'fuelTechs'"
            :icon="getColumnIcon('fuelTechs')"
          />
        </span>
      </div>

      <div 
        class="col-header" 
        style="width: 100px; text-align: right; margin-right: 15px;"
        @click="sort('generatorCap')"
      >
        Capacity
        <font-awesome-icon
          class="fal"
          v-if="sortBy === 'generatorCap'"
          :icon="getColumnIcon('generatorCap')"
        />
      </div>
    </div>
    
    <div
      class="card"
      v-for="(facility, index) in filteredFacilities"
      :key="index"
      :class="{
        'is-selected': isSelected(facility.stationId),
        'is-inactive': !active(facility.status)
      }"
      @mouseover="handleRowHover(facility)"
      @mouseout="handleRowOut"
      @click="handleRowClick(facility)"
    >
      <div class="bar-left" style="display: flex; position: absolute; left: 0; height: 100%;">
        <span
          v-for="(ft, ftIndex) in facility.fuelTechs"
          :key="ftIndex"
          :style="{ 
            backgroundColor: getColour(ft),
            opacity: getOpacity(ft)
          }"
          class="source-colour-side" />
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="card-content" style="width: 50%; margin-left: 1rem;">
          <h2 class="station-name">{{ facility.displayName }}</h2>
        </div>

        <div class="card-content" style="width: 150px;" v-show="!hideRegionColumn">
          <small style="color: #666;">{{ getRegionLabel(facility.regionId) }}</small>
        </div>

        <div class="stat" style="width: 150px;">
          <div class="stat-value" style="font-size: 11px; white-space: nowrap;">
            <span
              v-for="(ft, ftIndex) in facility.fuelTechs"
              :key="ftIndex"
              :style="{ opacity: getOpacity(ft) }"
            >
              {{ getFtLabel(ft) }}<span v-if="ftIndex !== facility.fuelTechs.length - 1">,</span>
            </span>
          </div>
        </div>

        <div class="stat" style="width: 140px; margin-right: 15px;">
          <div v-show="facility.generatorCap" class="stat-value has-text-right" style="font-size: 14px;">
            {{ getGeneratorCap(facility) | formatNumber }}
            <span class="unit">MW</span>

            <div
              v-if="showMaxCap(facility)"
              class="max-capcity"
            >
              (max: {{ facility.generatorCap | formatNumber }}
              <span class="unit">MW</span>)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/fontawesome-pro-light';
import { GraphDomains } from '@/domains/graphs';
import { getRegionAbbrByCode } from '@/domains/regions';
import { formatDateForDisplay } from '@/lib/formatter';

const colHeaders = [
  {
    id: 'fuelTechsColours',
    label: '',
  },
  {
    id: 'stationName',
    label: 'Name',
  },
  {
    id: 'regionId',
    label: 'Region',
  },
  {
    id: 'fuelTechs',
    label: 'Technology',
  },
  {
    id: 'generatorCap',
    label: 'Capacity (MW)',
  },
];

export default {
  components: {
    FontAwesomeIcon,
  },

  props: {
    filteredFacilities: Array,
    selectedFacility: Object,
    sortBy: String,
    orderBy: String,
    hideRegionColumn: Boolean,
  },

  data() {
    return {
      colHeaders,
      selected: null,
    };
  },

  computed: {
    iconSortUp() {
      return faSortUp;
    },
    iconSortDown() {
      return faSortDown;
    },
    facilitySelectedTechs() {
      return this.$store.getters.facilitySelectedTechs;
    },
  },

  watch: {
    selectedFacility(selected) {
      console.log(selected); // eslint-disable-line
      this.selected = selected;
    },
  },

  filters: {
    formatDate(value) {
      return formatDateForDisplay(value);
    },
  },

  methods: {
    active(status) {
      return status === 'Commissioned';
    },
    sort(colId) {
      this.$emit('orderChanged', colId);
    },
    handleRowClick(facility) {
      if (this.selected === facility) {
        this.selected = null;
        this.$emit('facilitySelect', null, true);
      } else {
        this.selected = facility;
        this.$emit('facilitySelect', facility, true);
      }
    },
    handleRowHover(facility) {
      this.$emit('facilityHover', facility, true);
    },
    handleRowOut() {
      this.$emit('facilityMouseout');
    },
    shouldRightAligned(colHeaderId) {
      return colHeaderId === 'generatorCap';
    },
    getColumnIcon(colHeaderId) {
      if (colHeaderId === this.sortBy) {
        if (this.orderBy === 'asc') {
          return this.iconSortUp;
        }
        return this.iconSortDown;
      }
      return '';
    },
    getFtLabel(ft) {
      const ftObj = GraphDomains[ft];
      if (ftObj) {
        if (ft === 'battery_discharging') {
          return 'Battery';
        }
        return ftObj.label;
      }
      return ft || '—';
    },
    getRegionLabel(code) {
      return getRegionAbbrByCode(code);
    },
    getColour(fuelTech) {
      const ftObj = fuelTech ? GraphDomains[fuelTech] : null;
      if (ftObj) {
        return ftObj.colour;
      }
      return 'transparent';
    },
    getOpacity(fuelTech) {
      if (this.facilitySelectedTechs.length === 0) {
        return 1;
      }
      return _.includes(this.facilitySelectedTechs, fuelTech)
        ? 1 : 0.1;
    },
    getGeneratorCap(facility) {
      if (this.facilitySelectedTechs.length === 0) {
        return facility.generatorCap;
      }

      let cap = 0;
      this.facilitySelectedTechs.forEach((d) => {
        if (facility.fuelTechRegisteredCap[d]) {
          cap += facility.fuelTechRegisteredCap[d];
        }
      });
      return cap;
    },
    showMaxCap(facility) {
      return facility.fuelTechs.length > 1 && this.facilitySelectedTechs.length > 0;
    },
    isSelected(stationId) {
      if (this.selected) {
        return stationId === this.selected.stationId;
      }
      return false;
    },
    getUnitTooltip(unit) {
      return `<span class="unit-tooltip">${unit.startType} ${unit.dispatchType}</span>`;
    },
    getCapacityTooltip(unit) {
      return `<span class="unit-tooltip">${unit.scheduleType}</span>`;
    },
    getStationLink(stationId) {
      return `/#/station/${stationId}`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

.card {
  margin-bottom: 1px;
  border-radius: 3px;
  font-size: 70%;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  opacity: 0.9;
  z-index: 9;
  box-shadow: none;

  &.is-inactive {
    opacity: 0.55;
  }
  &:hover {
    opacity: 1;
    box-shadow: 0 0 10px rgba(100,100,100,.3);
    opacity: 1;
    z-index: 10;
  }

  &.is-selected {
    box-shadow: 0 0 10px rgba(100,100,100,0.3);
    opacity: 1;
    transform: scale(1.03);
    z-index: 10;
  }

  .card-content {
    padding: 0.5rem 1rem 0.4rem;
  }
}

.stat {
  .stat-label {
    color: #999;
    font-size: 9px;
    font-weight: 600;
  }
  .stat-value {
    color: #000;
    .unit {
      font-size: 9px;
      position: relative;
      left: -3px;
    }
  }
}

.detail .stat {
  margin-bottom: 5px;
}

.unit-tooltip {
  text-transform: capitalize;
}

.source-colour-side {
  width: 10px;
  height: 100%;
  background-color: rgba(100,100,100,.8);

  // &:first-child {
  //   border-radius: 3px 0 0 3px;
  // }
  // &:last-child {
  //   border-radius: 0 3px 3px 0;
  // }
}
.bar-left .source-colour-side:first-child {
  border-radius: 3px 0 0 3px;
}
.bar-right .source-colour-side:last-child {
  border-radius: 0 3px 3px 0;
}
.table {
  tr th {
    color: #666;
    font-size: 9px;
  }
  td, th {
    border-color: #eee;
  }
}
.source-colour {
  width: 13px;
  height: 13px;
  background-color: rgba(255,255,255,.8);
  display: inline-block;
  vertical-align: text-bottom;
  margin-right: 0.1rem;
  position: relative;
  top: 1px;
  margin-right: 3px;
}
.station-name {
  // font-family: $header-font-family;
  font-weight: 600;
  font-size: 16px;
  // line-height: 15px;
}
.max-capcity {
  font-size: 70%;
  color: #787878;

  .unit {
    font-size: 80%;
    left: -2px;
  }
}
.column-headers {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  position: sticky;
  top: 89px;
  background-color: $background-alpha;
  padding: 5px 0;
  z-index: 11;
  border-bottom: 1px solid #333;

  @include tablet {
    top: 95px;
  }
}
.col-header {
  cursor: pointer;
  font-family: $header-font-family;
  font-size: 13px;
  font-weight: 600;
  user-select: none;
}
</style>
