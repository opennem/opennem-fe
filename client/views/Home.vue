<template>
  <div>
    <h1>openNEM</h1>

    <div style="display: flex">
      <div id="mapDiv"></div>
      <Vis2 style="width: 70%"></Vis2>
    </div>
    <!-- <Vis></Vis>
    <FTRegionVis></FTRegionVis> -->
  </div>
</template>

<script>
import Vis2 from '../components/ElectricityPriceVis'
import Vis from '../components/DemandVis'
import FTRegionVis from '../components/FuelTechRegionVis'
import { australiaSvg } from '../components/australiaSvg'

export default {
  components: {
    Vis2,
    Vis,
    FTRegionVis
  },
  created() {
    this.$store.dispatch('fetchData', { region: 'sa1', week: '2017-10-14' })
  },
  mounted() {
    const targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";
    const map = AmCharts.makeChart('mapDiv', {
      type: 'map',
      dataProvider: {
        mapVar: australiaSvg,
        images: [
          {
            svgPath: targetSVG,
            title: 'Victoria',
            latitude: -36.686043,
            longitude: 143.580322,
            url: '/#/regions/vic'
          },
          {
            svgPath: targetSVG,
            title: 'New South Wales',
            latitude: -31.840233,
            longitude: 145.612793,
            url: '/#/regions/nsw'
          },
          {
            svgPath: targetSVG,
            title: 'Tasmania',
            latitude: -41.640079,
            longitude: 146.315918,
            url: '/#/regions/tas'
          },
          {
            svgPath: targetSVG,
            title: 'Queensland',
            latitude: -20.917574,
            longitude: 142.702789,
            url: '/#/regions/qld'
          },
          {
            svgPath: targetSVG,
            title: 'South Australia',
            latitude: -30.000233,
            longitude: 136.209152,
            url: '/#/regions/sa'
          }
        ]
      }
    })
  }
}
</script>

<style>
h1 {
  /* position: absolute;
  z-index: 99;
  margin: 0;
  top: 1rem;
  right: 1rem; */
}
h3 {
  border-bottom: 1px solid #000;
}
#mapDiv {
  width: 30%;
  height: 400px;
}

</style>
