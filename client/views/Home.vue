<template>
  <div>
    <!-- <h1>openNEM</h1> -->

    <div style="display: flex">
      <MapVis style="width: 30%"></MapVis>
      <GenerationVis style="width: 70%" :genData="genData"></GenerationVis>
    </div>
    <!-- <Vis></Vis>
    <FTRegionVis></FTRegionVis> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MapVis from '../components/Map'
import GenerationVis from '../components/GenerationVis'

// import Vis from '../components/DemandVis'
// import FTRegionVis from '../components/FuelTechRegionVis'

export default {
  components: {
    GenerationVis,
    MapVis,
    // Vis,
    // FTRegionVis,
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

</style>
