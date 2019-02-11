<template>
<div>
  <button class="button" @click="toggleEmissions">Show Emissions</button>
  <div id="map"></div>
  <input class="input" type="text" placeholder="Filter" v-model="filterString">
  <generator-grid :generatorsData="filteredGenerators"/>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import L from 'leaflet';
import GeneratorGrid from '@/components/Generator/Grid';

// AU geojson from https://github.com/rowanhogan/australian-states/blob/master/states.geojson
// TODO: delete this if unused
// import AUGeoJson from '@/assets/au-geojson.json';

export default {
  components: {
    GeneratorGrid,
  },
  data() {
    return {
      // filteredGenerators: [],
      filterString: '',
      map: null,
      generatorsFeature: null,
      emissionsFeature: null,
    };
  },
  computed: {
    ...mapGetters({
      generatorsData: 'generatorsData',
    }),
    filteredGenerators() {
      return this.generatorsData.filter(g =>
        g.stationName.toLowerCase().includes(this.filterString.toLowerCase()),
      );
    },
  },
  watch: {
    filteredGenerators(newData) {
      this.map.removeLayer(this.generatorsFeature);
      this.generatorsFeature = L.featureGroup();

      newData.forEach((d) => {
        const location = d.location;
        if (location) {
          const lat = location.latitude;
          const lng = location.longitude;

          // L.marker([lat, lng]).addTo(this.map);
          const fillColor = d.emissionsYtd > 0 ? '#C74523' : 'green';
          const radius = d.emissionsYtd > 0 ? d.emissionsYtd / 10 : 0;
          L.circle([lat, lng], {
            color: '#C74523',
            radius: 1000,
          }).addTo(this.generatorsFeature);

          L.circle([lat, lng], {
            fillColor,
            fillOpacity: 0.3,
            stroke: 0,
            radius,
          }).addTo(this.emissionsFeature);
        }
      });

      this.map.addLayer(this.generatorsFeature);
    },
  },
  mounted() {
    this.$store.dispatch('fetchGeneratorsData');
    this.map = L.map('map').setView([-29.186936, 143.633537], 4);
    const tileLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png',
    });
    this.generatorsFeature = L.featureGroup();
    this.emissionsFeature = L.featureGroup();

    tileLayer.addTo(this.map);
    // this.generatorsFeature.addTo(this.map);
    // this.emissionsFeature.addTo(this.map);
  },
  methods: {
    toggleEmissions() {
      this.map.addLayer(this.emissionsFeature);
    },
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