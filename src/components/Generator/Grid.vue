<template>
  <table class="table is-hoverable is-narrow is-fullwidth">
    <thead>
      <tr>
        <th
          v-for="(header, index) in colHeaders"
          :key="index"
          :class="{ 'has-text-right': shouldRightAligned(header.id) }"
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
        :class="{ 'is-selected': isSelected(generator.stationName) }"
        @click="handleRowClick(generator)"
      >
        <td style="width: 40%;">
          <div style="display: flex">
            <span class="source-colour"
              :style="{ 
                backgroundColor: getColour(generator.fuelTechs)
              }" />
            <span class="station-name">{{ generator.stationName }}</span>
          </div>
          
        </td>
        <td>{{ getRegionLabel(generator.regionId) }}</td>
        <td>
          <span v-for="(ft, ftIndex) in generator.fuelTechs" :key="ftIndex">
            {{ getFtLabel(ft) }}
          </span>
        </td>
        <td class="has-text-right">{{ generator.generatorCap | formatNumber }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td>{{ totalGenerators }}</td>
        <td></td>
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
    id: 'stationName',
    label: 'Name',
  },
  {
    id: 'regionId',
    label: 'Region',
  },
  {
    id: 'fuelTechs',
    label: 'Fuel Tech',
  },
  {
    id: 'generatorCap',
    label: 'Capacity',
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
    sort(stationName) {
      this.$emit('orderChanged', stationName);
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
      return ft;
    },
    getRegionLabel(code) {
      return getRegionLabelByCode(code);
    },
    getColour(fuelTechs) {
      const ftObj = fuelTechs[0] ? GraphDomains[fuelTechs[0]] : null;
      if (ftObj) {
        return ftObj.colour;
      }
      return 'transparent';
    },
    isSelected(stationName) {
      if (this.selected) {
        return stationName === this.selected.stationName;
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
  }
  .station-name {
    margin-left: 2px;
    display: block; 
    width: 95%;
  }
}
</style>
