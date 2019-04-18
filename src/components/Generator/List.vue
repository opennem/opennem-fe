<template>
  <div style="margin-bottom: 1rem;">
    <!-- <div class="" style="display: flex; justify-content: space-between; align-items: center;">
      <div class="" style="width: 50%; margin-left: 20px;">Name</div>
      <div style="width: 150px">Technology</div>
      <div style="width: 140px">Capacity</div>
    </div> -->
    <div
      class="card"
      v-for="(generator, index) in generatorsData"
      :key="index"
      :class="{
        'is-selected': isSelected(generator.stationId),
        'is-inactive': !active(generator.status)
      }"
      @mouseover="handleRowHover(generator)"
      @mouseout="handleRowOut"
      @click="handleRowClick(generator)"
    >
      <!-- <div class="bar-right" style="display: flex; position: absolute; right: 0; height: 100%;">
        <span
          v-for="(ft, ftIndex) in generator.fuelTechs"
          :key="ftIndex"
          :style="{ 
            backgroundColor: getColour(ft)
          }"
          class="source-colour-side" />
      </div> -->
      <div class="bar-left" style="display: flex; position: absolute; left: 0; height: 100%;">
        <span
          v-for="(ft, ftIndex) in generator.fuelTechs"
          :key="ftIndex"
          :style="{ 
            backgroundColor: getColour(ft)
          }"
          class="source-colour-side" />
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="card-content" style="width: 50%; margin-left: 15px;">
          <!-- <div style="display: flex">
            <span
              v-for="(ft, ftIndex) in generator.fuelTechs"
              :key="ftIndex"
              :style="{ 
                backgroundColor: getColour(ft)
              }"
              class="source-colour" />
          </div> -->

          <h2 class="station-name">{{ generator.displayName }}</h2>
          <small style="color: #666;">{{ getRegionLabel(generator.regionId) }}</small>
        </div>

        <div class="stat" style="width: 150px;">
          <!-- <div class="stat-label" style="font-size: 9px;">Technology</div> -->
          <div class="stat-value" style="font-size: 11px; white-space: nowrap;">
            <span v-for="(ft, ftIndex) in generator.fuelTechs" :key="ftIndex">
              {{ getFtLabel(ft) }}<span v-if="ftIndex !== generator.fuelTechs.length - 1">,</span>
            </span>
          </div>
        </div>

        <div class="stat" style="width: 140px; margin-right: 15px;">
          <div v-show="generator.generatorCap" class="stat-value has-text-right" style="font-size: 18px;">
            {{ generator.generatorCap | formatNumber }}
            <span class="unit">MW</span>
          </div>
        </div>

        <!-- <h5>
          <span>{{ generator.status }}</span>
          <span v-if="generator.statusDate">({{ generator.statusDate | formatDate }})</span>
        </h5> -->
      </div>
      <div class="detail card-content" v-show="isSelected(generator.stationId)" style="padding: 5px 15px 10px 30px; box-shadow: inset 0 1px 6px rgba(100, 100, 100, 0.1); background: #f7f7f7; border-radius: 0 0 3px 3px">

        <div style="display: flex;">
          <div style="width: 50%;">
            <div class="stat">
              <div class="stat-label">Status</div>
              <div class="stat-value">
                <strong>{{ generator.status }}</strong>
                <em v-if="generator.statusDate">on {{ generator.statusDate | formatDate }}</em>
              </div>
            </div>

            <!-- <div class="stat">
              <div class="stat-label">Station Name</div>
              <div class="stat-value">
                {{ generator.stationName }}
              </div>
            </div> -->
            
            <div class="stat">
              <div class="stat-label">Participant</div>
              <div class="stat-value">
                {{ generator.participant }}
              </div>
            </div>

            <a
              class="button is-small is-rounded is-primary is-outlined"
              style="font-size: 80%;"
              target="station_window"
              :href="getStationLink(generator.stationId)">
              more
            </a>
          </div>

          <div style="width: 50%;">
            <table class="table is-narrow is-fullwidth is-bordered is-hoverable" style="background: transparent; margin-bottom: 0; margin-top: 2px;">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th class="has-text-right">Capacity</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(unit, index) in generator.units" :key="index">
                  <td v-tooltip="getUnitTooltip(unit)">
                    <div style="display: flex">
                      <span class="source-colour"
                        :style="{ 
                          backgroundColor: getColour(unit.fuelTech)
                        }" />
                      <span class="unit-name">{{ unit.name }}</span>
                    </div>
                    <!-- <strong style="font-size: 8px; text-transform: capitalize;">
                      {{ unit.scheduleType }} {{ unit.startType }} {{ unit.dispatchType }}
                    </strong> -->
                  </td>
                  <!-- <td>{{ getFtLabel(unit.fuelTech) }}</td>
                  <td>{{ unit.firstRun }}</td>
                  <td>{{ unit.scheduleType }}</td>
                  <td>{{ unit.startType }}</td>
                  <td>{{ unit.dispatchType }}</td> -->
                  <td class="has-text-right" v-tooltip="getCapacityTooltip(unit)">
                    <strong :class="{ 'has-text-grey': unit.startType === 'not dispatched'}">
                      {{ unit.regCap | formatNumber }}
                    </strong>
                  </td>
                  <!-- <td class="has-text-right">{{ unit.maxCap | formatNumber }}</td> -->
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/fontawesome-pro-light';
import { GraphDomains } from '@/domains/graphs';
import { getRegionLabelByCode } from '@/domains/regions';
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
  // {
  //   id: 'location.state',
  //   label: 'State',
  // },
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
    generatorsData: Array,
    selectedGenerator: Object,
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
    totalCap() {
      let total = 0;
      this.generatorsData.forEach((d) => {
        total += d.generatorCap;
      });
      return total;
    },
    totalEmissions() {
      let total = 0;
      this.generatorsData.forEach((d) => {
        total += d.emissionsYtd;
      });
      return total;
    },
    totalGenerators() {
      return this.generatorsData.length;
    },
  },

  watch: {
    selectedGenerator(selected) {
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
      if (colId !== 'fuelTechsColours') {
        this.$emit('orderChanged', colId);
      }
    },
    handleRowClick(generator) {
      this.selected = generator;
      this.$emit('generatorSelected', generator, true);
    },
    handleRowHover(generator) {
      this.$emit('generatorHover', generator, true);
    },
    handleRowOut() {
      this.$emit('generatorMouseout');
    },
    shouldRightAligned(colHeaderId) {
      return (colHeaderId === 'generatorCap' || colHeaderId === 'emissionsYtd');
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
        return ftObj.label;
      }
      return ft ? ft : '—';
    },
    getRegionLabel(code) {
      return getRegionLabelByCode(code);
    },
    getColour(fuelTech) {
      const ftObj = fuelTech ? GraphDomains[fuelTech] : null;
      if (ftObj) {
        return ftObj.colour;
      }
      return 'rgba(100,100,100,.1)';
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
    transform: scale(1.02);
    z-index: 10;
  }

  &.is-selected {
    box-shadow: 0 0 20px rgba(100,100,100,0.7);
    opacity: 1;
    transform: scale(1.04);
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
  font-family: $header-font-family;
  font-weight: 600;
  font-size: 14px;
  line-height: 15px;
}
</style>
