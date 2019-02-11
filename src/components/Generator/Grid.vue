<template>
  <table class="table is-striped is-hoverable is-narrow">
    <thead>
      <tr>
        <th>Station Name</th>
        <th>Region</th>
        <th>Emissions (YTD)</th>
        <th>Fuel Tech</th>
        <th>Capacity</th>
        <th>Number of units</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(generator, index) in generatorsData" :key="index">
        <td>{{ generator.stationName }}</td>
        <td>{{ generator.regionId }}</td>
        <td>{{ generator.emissionsYtd }}</td>
        <td>
          <span v-for="(ft, ftIndex) in generator.fuelTechs" :key="ftIndex">
            {{ ft }}
          </span>
        </td>
        <td>{{ generator.generatorCap }}</td>
        <td>{{ generator.unitNum }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    generatorsData: Array,
  },
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  margin-bottom: 3rem;
}
</style>
