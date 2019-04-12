<template>
  <table class="table is-hoverable is-narrow is-fullwidth">
    <thead>
      <tr>
        <th
          v-for="(header, index) in colHeaders"
          :key="index"
          :class="{ 'has-text-right': shouldRightAligned(header.id) }"
          v-show="!((index === 2) && hideRegionColumn)"
          @click="sort(header.id)"
          >
            {{ header.label }}
            <font-awesome-icon
              class="fal"
              v-if="header.id === sortBy"
              :icon="getColumnIcon(header.id)"
            />
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(generator, index) in generatorsData"
        :key="index"
        :class="{
          'is-selected': isSelected(generator.stationId),
          'is-inactive': !active(generator.status)
        }"
        @click="handleRowClick(generator)"
      >
        <td style="width: 50px;">
          <div style="display: flex">
            <span
              v-for="(ft, ftIndex) in generator.fuelTechs"
              :key="ftIndex"
              :style="{ 
                backgroundColor: getColour(ft)
              }"
              class="source-colour" />
          </div>
        </td>
        <td>
          <span class="station-name">{{ generator.displayName }}</span>
        </td>
        <td style="width: 150px;" v-show="!hideRegionColumn">{{ getRegionLabel(generator.regionId) }}</td>
        <!-- <td style="width: 150px;" v-show="!hideRegionColumn">{{ generator.location.state }}</td> -->
        <td style="width: 150px;">
          <span v-for="(ft, ftIndex) in generator.fuelTechs" :key="ftIndex">
            {{ getFtLabel(ft) }}<span v-if="ftIndex !== generator.fuelTechs.length - 1">,</span>
          </span>
        </td>
        <td class="has-text-right" style="width: 100px;">{{ generator.generatorCap | formatNumber }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td>{{ totalGenerators }}</td>
        <td></td>
        <td v-show="!hideRegionColumn"></td>
        <!-- <td v-show="!hideRegionColumn"></td> -->
        <td></td>
        <td class="has-text-right">{{ totalCap | formatNumber }}</td>
      </tr>
    </tfoot>
  </table>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/fontawesome-pro-light';
import { GraphDomains } from '@/domains/graphs';
import { getRegionLabelByCode } from '@/domains/regions';

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
      return '#fff';
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
@import "../../styles/variables.scss";

table {
  margin-bottom: 3rem;
  font-size: 0.9em;
  th {
    font-family: $header-font-family;
    white-space: nowrap;
    background: #eee;
  }
  td {
    font-size: 0.9em;
  }
  tfoot td {
    border-top: 1px solid #000;
    font-weight: bold;
  }

  .source-colour {
    width: 17px;
    height: 17px;
    background-color: rgba(255,255,255,.8);
    display: inline-block;
    vertical-align: text-bottom;
    margin-right: 0.1rem;
    position: relative;
    top: 1px;
    margin-right: 3px;
  }
  .station-name {
    display: block; 
    width: 95%;
  }

  .is-inactive td {
    opacity: 0.65;
  }
}
</style>
