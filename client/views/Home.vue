<template>
  <div>
    <GenerationVis style="width: 100%" :genData="genData"></GenerationVis>

    <!-- <h1>openNEM</h1> -->
    <!-- <MapVis style="width: 30%"></MapVis> -->
    
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
  created() {
    this.$store.dispatch('fetchAllRegionsFtGen', { week: this.weekStarting })
  },
  computed: {
    ...mapGetters({
      genData: 'getAllRegionsFtGen',
      weekStarting: "getWeekStarting"
    })
  },
  watch: {
    weekStarting(newValue) {
      this.$store.dispatch('fetchAllRegionsFtGen', { week: newValue })
    }
  }
}
</script>

<style>

</style>
