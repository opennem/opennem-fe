<template>
  <table class="table is-striped is-hoverable is-narrow">
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
      <tr v-for="(generator, index) in generatorsData" :key="index" @click="handleRowClick(generator)">
        <td>{{ generator.stationName }}</td>
        <td style="width: 200px;">{{ getRegionLabel(generator.regionId) }}</td>
        <td style="width: 200px;">
          <span v-for="(ft, ftIndex) in generator.fuelTechs" :key="ftIndex">
            {{ getFtLabel(ft) }}
          </span>
        </td>
        <td class="has-text-right">{{ generator.generatorCap | formatNumber }}</td>
        <td class="has-text-right" style="width: 200px;">{{ generator.emissionsYtd | formatNumber }}</td>
        <!-- <td>{{ generator.unitNum }}</td> -->
      </tr>
    </tbody>
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
    label: 'Station Name',
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
  {
    id: 'emissionsYtd',
    label: 'Emissions (YTD)',
  },
  // {
  //   id: 'unitNum',
  //   label: 'Number of units',
  // },
];

export default {
  components: {
    FontAwesomeIcon,
  },
  props: {
    generatorsData: Array,
    sortBy: String,
    orderBy: String,
  },
  data() {
    return {
      colHeaders,
    };
  },
  computed: {
    iconSortUp() {
      return faSortUp;
    },
    iconSortDown() {
      return faSortDown;
    },
  },
  methods: {
    sort(stationName) {
      this.$emit('orderChanged', stationName);
    },
    handleRowClick(generator) {
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
  },
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  margin-bottom: 3rem;

  th {
    white-space: nowrap;
  }
}
</style>
