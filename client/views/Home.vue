<template>
  <div>
    <!-- <h1>openNEM</h1> -->

    <div style="display: flex">
      <MapVis style="width: 30%"></MapVis>
      <Vis2 style="width: 70%"></Vis2>
    </div>
    <!-- <Vis></Vis>
    <FTRegionVis></FTRegionVis> -->
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
  created() {
    this.$store.dispatch('fetchAllRegionsFtGen', { week: '2017-10-14' })
  },
  
}
</script>

<style>
h3 {
  border-bottom: 1px solid #000;
}


</style>
