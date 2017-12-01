<template>
  <div class="ft-region-chart-wrapper">
    <div id="map-au"></div>
  </div>
</template>

<script>
import { australiaSvg } from './AustraliaSvg'

export default {
  created() {
  },
  data() {
    return {
    }
  },
  mounted() {
    const targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";
    const map = AmCharts.makeChart('map-au', {
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

<style scoped>
#map-au {
  width: 100%;
  height: 800px;
}
</style>
