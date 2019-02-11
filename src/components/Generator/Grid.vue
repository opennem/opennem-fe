<template>
  <table class="table is-striped is-hoverable is-narrow">
    <thead>
      <tr>
        <th @click="sort('stationName')">Station Name</th>
        <th @click="sort('regionId')">Region</th>
        <th @click="sort('emissionsYtd')">Emissions (YTD)</th>
        <th @click="sort('fuelTechs')">Fuel Tech</th>
        <th @click="sort('generatorCap')">Capacity</th>
        <th @click="sort('unitNum')">Number of units</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(generator, index) in generatorsData" :key="index">
        <td>{{ generator.stationName }}</td>
        <td>{{ generator.regionId }}</td>
        <td>{{ generator.emissionsYtd }}</td>
        <td>
          <span v-for="(ft, ftIndex) in generator.fuelTechs" :key="ftIndex">
            {{ getFtLabel(ft) }}
          </span>
        </td>
        <td>{{ generator.generatorCap }}</td>
        <td>{{ generator.unitNum }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { GraphDomains } from '@/domains/graphs';

export default {
  props: {
    generatorsData: Array,
  },
  methods: {
    sort(stationName) {
      this.$emit('orderBy', stationName);
    },
    getFtLabel(ft) {
      const ftObj = GraphDomains[ft];
      if (ftObj) {
        return ftObj.label;
      }
      return ft;
    },
  },
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  margin-bottom: 3rem;
}
</style>
