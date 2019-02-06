<template>
<div>

  <div id="map"></div>

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
// AU geojson from https://github.com/rowanhogan/australian-states/blob/master/states.geojson
import { mapGetters } from 'vuex';
import L from 'leaflet';
// import AUGeoJson from '@/assets/au-geojson.json';

export default {
  // components: {
  //   LMap,
  //   LTileLayer,
  //   LMarker,
  // },
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
    // [134.489563, -25.734968]
    // [-25.734968, 134.489563]
    // -29.186936, 143.633537
    // [51.505, -0.09]
    const map = L.map('map').setView([-29.186936, 143.633537], 4);
    const tileLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png',
    });

    tileLayer.addTo(map);
  },
};
</script>

<style lang="scss" scoped>
#map {
  width: 100%;
  height: 400px;
  z-index: 1;
}
</style>