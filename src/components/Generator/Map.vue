<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';

export default {
  props: {
    generatorsData: Array,
    panTo: Object,
  },

  data() {
    return {
      tileLayer: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 3,
        maxZoom: 10,
        ext: 'png',
      }),
      map: null,
      generatorsFeature: null,
      emissionsFeature: null,
    };
  },

  watch: {
    generatorsData(newData) {
      this.updateMap(newData);
    },
    panTo(location) {
      // const lat = location.latitude;
      // const lng = location.longitude;
      // this.map.panTo(new L.LatLng(lat, lng));
    },
  },

  mounted() {
    this.setup();
  },

  methods: {
    setup() {
      this.map = L.map('map').setView([-29.186936, 143.633537], 4);
      this.generatorsFeature = L.featureGroup();
      this.emissionsFeature = L.featureGroup();

      this.tileLayer.addTo(this.map);
      // this.generatorsFeature.addTo(this.map);
      // this.emissionsFeature.addTo(this.map);
    },

    updateMap(data) {
      this.map.removeLayer(this.generatorsFeature);
      this.generatorsFeature = L.featureGroup();

      data.forEach((d) => {
        const location = d.location;
        if (location) {
          const lat = location.latitude;
          const lng = location.longitude;

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
      this.map.fitBounds(this.generatorsFeature.getBounds());
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