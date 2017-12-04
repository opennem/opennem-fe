<template>
  <div class="ft-region-chart-wrapper">
    <div id="map-au"></div>
  </div>
</template>

<script>
import { australiaSvg } from './AustraliaSvg'

export default {
  created() {},
  data() {
    return {}
  },
  mounted() {
    const targetSVG =
      'M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z'
    const map = AmCharts.makeChart('map-au', {
      type: 'map',
      areasSettings: {
        autoZoom: false,
        color: '#ccc',
        selectedColor: '#666',
        selectable: true
      },
      dataProvider: {
        mapVar: australiaSvg,
        getAreasFromMap: true
        // images: [
        //   {
        //     svgPath: targetSVG,
        //     title: 'Victoria',
        //     latitude: -36.686043,
        //     longitude: 143.580322
        //   },
        //   {
        //     svgPath: targetSVG,
        //     title: 'New South Wales',
        //     latitude: -31.840233,
        //     longitude: 145.612793
        //   },
        //   {
        //     svgPath: targetSVG,
        //     title: 'Tasmania',
        //     latitude: -41.640079,
        //     longitude: 146.315918
        //   },
        //   {
        //     svgPath: targetSVG,
        //     title: 'Queensland',
        //     latitude: -20.917574,
        //     longitude: 142.702789
        //   },
        //   {
        //     svgPath: targetSVG,
        //     title: 'South Australia',
        //     latitude: -30.000233,
        //     longitude: 136.209152
        //   }
        // ]
      }
    })

    map.addListener('clickMapObject', event => {
      let region = null
      switch (event.mapObject.id) {
        case 'AU-NSW':
          region = 'nsw'
          break
        case 'AU-QLD':
          region = 'qld'
          break
        case 'AU-SA':
          region = 'sa'
          break
        case 'AU-TAS':
          region = 'tas'
          break
        case 'AU-VIC':
          region = 'vic'
          break
      }
      console.log(event.mapObject)
      this.$router.replace({ name: 'regions', params: { region } })
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
