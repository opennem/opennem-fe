<template>
<div>
  <button class="button" @click="toggleEmissions">Show Emissions</button>
  <div id="map"></div>

  <table class="table is-striped is-hoverable is-narrow">
    <thead>
      <tr>
        <th>Station Name</th>
        <th>Region</th>
        <th>Emissions (YTD)</th>
        <th>Fuel Tech</th>
        <th>Capacity</th>
        <th>Number of units</th>
      </tr>
    </thead>
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
import { mapGetters } from 'vuex';
import L from 'leaflet';

// AU geojson from https://github.com/rowanhogan/australian-states/blob/master/states.geojson
// TODO: delete this if unused
// import AUGeoJson from '@/assets/au-geojson.json';

export default {
  data() {
    return {
      map: null,
      emissionsFeature: null,
    };
  },
  computed: {
    ...mapGetters({
      generatorsData: 'generatorsData',
    }),
  },
  watch: {
    generatorsData(newData) {
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
          }).addTo(this.map);

          L.circle([lat, lng], {
            fillColor,
            fillOpacity: 0.3,
            stroke: 0,
            radius,
          }).addTo(this.emissionsFeature);
        }
      });
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
    this.emissionsFeature = L.featureGroup();

    tileLayer.addTo(this.map);
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
table {
  margin-bottom: 3rem;
}
</style>