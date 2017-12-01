<template>
  <div>
    <!-- <h1>openNEM</h1> -->

    <div style="display: flex">
      <MapVis style="width: 30%"></MapVis>
      <Vis2 style="width: 70%" :genData="genData"></Vis2>
    </div>
    <Vis></Vis>
    <FTRegionVis></FTRegionVis>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Vis2 from '../components/GenerationVis'
import Vis from '../components/DemandVis'
import MapVis from '../components/Map'
import FTRegionVis from '../components/FuelTechRegionVis'

export default {
  components: {
    Vis2,
    Vis,
    FTRegionVis,
    MapVis
  },
  mounted() {
    this.$store.dispatch('fetchAllRegionsFtGen', { week: '2017-10-14' })
  },
  computed: {
    ...mapGetters({
       genData: 'getAllRegionsFtGen'
    })
  },
}
</script>

<style>
h3 {
  border-bottom: 1px solid #000;
}
</style>
