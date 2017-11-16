<template>
  <div>
    <h1>National Electricity Market</h1>
    <Vis></Vis>
    <FTRegionVis></FTRegionVis>
  </div>
</template>

<script>
import Vis from '../components/DemandVis'
import FTRegionVis from '../components/FuelTechRegionVis'

export default {
  components: {
    Vis,
    FTRegionVis
  },
}
</script>

<style>
h3 {
  border-bottom: 1px solid #000;
}

</style>
