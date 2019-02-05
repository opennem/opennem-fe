<template>
<div>
  <table>
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
</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters({
      generatorsData: 'generatorsData',
    }),
  },
  // watch: {
  //   generatorsData(newData) {
  //     console.log(newData);
  //   },
  // },
  mounted() {
    this.$store.dispatch('fetchGeneratorsData');
  },
};
</script>

<style lang="scss" scoped>
</style>