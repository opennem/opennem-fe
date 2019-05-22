<template>
  <div class="card-wrapper">
    <div class="column-headers">
      <div 
        class="name-col col-header" 
        :style="{ width: hideRegionColumn ? '60%' : '50%'}"
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
        class="region-col col-header" 
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
        class="tech-col col-header" 
      >
        <span @click="sort('fuelTechs')">
          {{ techHeaderName }}
          <font-awesome-icon
            class="fal"
            v-if="sortBy === 'fuelTechs'"
            :icon="getColumnIcon('fuelTechs')"
          />
        </span>
      </div>

      <div 
        class="cap-col col-header" 
        @click="sort('generatorCap')"
      >
        Gen. Capacity
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
      :id="facility.stationId"
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
      
      <div class="facility-detail">
        <div class="name-col" :style="{ width: hideRegionColumn ? '60%' : '50%'}">
          <h2 class="station-name">{{ facility.displayName }}</h2>
        </div>

        <div class="region-col" v-show="!hideRegionColumn">
          <small style="color: #666;">{{ getRegionLabel(facility.regionId) }}</small>
        </div>

        <div class="tech-col stat">
          <div class="stat-value" v-if="facility.genFuelTechs.length">
            <span
              v-for="(ft, genFtIndex) in facility.genFuelTechs"
              :key="genFtIndex"
              :style="{ opacity: getOpacity(ft) }"
            >
              {{ getFtLabel(ft) }}
              <small v-if="facility.genFuelTechs.length > 1">({{ facility.fuelTechRegisteredCap[ft] | formatNumber}}MW)</small>
              <span v-if="genFtIndex !== facility.genFuelTechs.length - 1"><br /></span>
            </span>
          </div>
          <div class="stat-value" v-if="facility.loadFuelTechs.length">
            <em
              v-for="(ft, loadFtIndex) in facility.loadFuelTechs"
              :key="loadFtIndex"
              :style="{ opacity: getOpacity(ft) }"
            >
              {{ getFtLabel(ft) }}
              <small>({{ facility.fuelTechRegisteredCap[ft] | formatNumber}}MW)</small>
              <span v-if="loadFtIndex !== facility.loadFuelTechs.length - 1"><br /></span>
            </em>
          </div>
        </div>

        <div class="cap-col stat">
          <div v-show="facility.generatorCap" class="stat-value has-text-right">
            {{ getGeneratorCap(facility) | formatNumber }}
            <span class="unit" v-if="getGeneratorCap(facility) !== 0">MW</span>
          </div>
          <div v-show="!facility.generatorCap" class="stat-value has-text-right">
            –
          </div>
        </div>
      </div>
    </div>

    <totals
      :position="totalsPosition"
      :div-width="divWidth"
      :total-facilities="totalFacilities"
      :total-cap="totalCap"
    />

  </div>
</template>

<script>
import * as _ from 'lodash';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/fontawesome-pro-light';
import { GraphDomains } from '@/domains/graphs';
import { getRegionAbbrByCode } from '@/domains/regions';
import { formatDateForDisplay } from '@/lib/formatter';
import Totals from './Totals';

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
    Totals,
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
      divWidth: 0,
      divHeight: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    };
  },

  computed: {
    widthBreak() {
      return this.windowWidth < 769;
    },
    techHeaderName() {
      return this.widthBreak ? 'Tech' : 'Technology';
    },
    totalsPosition() {
      return this.divHeight > this.windowHeight ? 'fixed' : 'static';
    },
    iconSortUp() {
      return faSortUp;
    },
    iconSortDown() {
      return faSortDown;
    },
    facilitySelectedTechs() {
      return this.$store.getters.facilitySelectedTechs;
    },
    totalFacilities() {
      return this.filteredFacilities.length;
    },
    totalCap() {
      let total = 0;
      this.filteredFacilities.forEach((facility) => {
        if (this.facilitySelectedTechs.length === 0) {
          total += facility.generatorCap;
        } else {
          this.facilitySelectedTechs.forEach((ft) => {
            if (facility.fuelTechRegisteredCap[ft]) {
              total += facility.fuelTechRegisteredCap[ft];
            }
          });
        }
      });
      return total;
    },
  },

  watch: {
    selectedFacility(selected) {
      if (selected) {
        this.selected = selected;
        const $selected = document.getElementById(selected.stationId);
        if (
          $selected.getBoundingClientRect().top < 110 ||
          $selected.getBoundingClientRect().top >= this.windowHeight - 60
        ) {
          $selected.scrollIntoView({
            behavior: 'auto',
            block: 'center',
          });
        }
      }
    },

    filteredFacilities() {
      this.$nextTick(() => {
        this.divHeight = this.$el.offsetHeight;
      });
    },
  },

  mounted() {
    this.divWidth = this.$el.offsetWidth;

    window.addEventListener('resize', _.debounce(() => {
      this.divWidth = this.$el.offsetWidth;
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    }, 200));
  },

  updated() {
    this.$nextTick(() => {
      this.divHeight = this.$el.offsetHeight;
    });
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
      if (!this.widthBreak) {
        if (this.selected === facility) {
          this.selected = null;
          this.$emit('facilitySelect', null, true);
        } else {
          this.selected = facility;
          this.$emit('facilitySelect', facility, true);
        }
      }
    },
    // eslint-disable-next-line
    handleRowHover: _.debounce(function (facility) {
      this.$emit('facilityHover', facility, true);
    }, 200),
    // eslint-disable-next-line
    handleRowOut: _.debounce(function () {
      this.$emit('facilityMouseout');
    }, 200),
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
        if (ft === 'solar') {
          return 'Solar';
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
        ? 1 : 0.3;
    },
    getGeneratorCap(facility) {
      if (this.facilitySelectedTechs.length === 0) {
        return facility.generatorCap;
      }

      let cap = 0;
      this.facilitySelectedTechs.forEach((d) => {
        if (GraphDomains[d].type !== 'loads' && facility.fuelTechRegisteredCap[d]) {
          cap += facility.fuelTechRegisteredCap[d];
        }
      });
      return cap;
    },
    isSelected(stationId) {
      if (this.selected) {
        return stationId === this.selected.stationId;
      }
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

.card-wrapper {
  margin-bottom: 2rem;
  position: relative;
  padding: 0 10px;

  @include tablet {
    padding: 0;
  }
}

.card {
  margin-bottom: 1px;
  font-size: 70%;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  opacity: 0.9;
  z-index: 9;
  box-shadow: none;
  min-height: 25px;

  &.is-inactive {
    opacity: 0.55;
  }
  &:hover {
    opacity: 1;
    box-shadow: 0 0 5px rgba(100,100,100,.2);
    opacity: 1;
    z-index: 10;
  }

  &.is-selected {
    box-shadow: 0 0 10px rgba(100,100,100,0.2);
    opacity: 1;
    transform: scale(1.02);
    z-index: 10;
  }

  .card-content {
    padding: 0;
  }
}

.facility-detail {
  min-height: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  width: 5px;
  height: 100%;
  background-color: rgba(100,100,100,.8);

  @include tablet {
    width: 10px;
  }
}

.station-name {
  font-weight: 600;
  font-size: 12px;

  @include tablet {
    font-size: 14px;
  }
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
  top: 0;
  background-color: $background-alpha;
  padding-bottom: 5px;
  z-index: 11;
  border-bottom: 1px solid #333;

  @include tablet {
    top: 59px;
  }
}
.col-header {
  cursor: pointer;
  font-family: $header-font-family;
  font-size: 9px;
  font-weight: 600;
  user-select: none;
  padding-top: 5px;

  @include tablet {
    font-size: 11px;
  }
}

.name-col {
  margin-left: 1rem;

  @include tablet {
    margin-left: 2rem;
  }
}
.region-col {
  width: 14%;

  &.col-header {
    white-space: nowrap;
  }
}
.tech-col {
  width: 17%;

  .stat-value {
    font-size: 8px;

    @include tablet {
      font-size: 9px;
    }
  }

  &.col-header {
    white-space: nowrap;
  }
}

.cap-col {
  width: 20%;
  text-align: right;
  margin-right: 15px;

  &.col-header {
    white-space: nowrap;
  }

  .stat-value{
    font-size: 12px;

    @include tablet {
      font-size: 14px;
    }
  }

  &.stat .unit {
    font-size: 8px;
    left: 0;

    @include tablet {
      font-size: 10px;
    }
  }
}
</style>
