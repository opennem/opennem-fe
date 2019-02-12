<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';

const MapAttribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.';

export default {
  props: {
    generatorsData: Array,
    selectedGenerator: Object,
    shouldZoomWhenSelected: Boolean,
  },

  data() {
    return {
      tileLayer: L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 3,
        maxZoom: 12,
        ext: 'png',
      }),
      marker: L.icon({
        iconUrl: '/images/marker.png',
        iconSize: [26, 41],
        iconAnchor: [13, 41],
        shadowUrl: '/images/marker-shadow.png',
        shadowSize: [38, 34],
        shadowAnchor: [0, 34],
      }),
      map: null,
      selectedMarker: null,
      generatorsFeature: null,
      emissionsFeature: null,
    };
  },

  watch: {
    generatorsData(newData) {
      this.updateMap(newData);
    },
    selectedGenerator(generator) {
      if (generator) {
        const hasLocation = generator.location;

        if (this.selectedMarker) {
          this.selectedMarker.remove();
        }

        if (hasLocation) {
          const lat = hasLocation.latitude;
          const lng = hasLocation.longitude;
          const loc = new L.LatLng(lat, lng);

          this.selectedMarker = L.marker([lat, lng], { icon: this.marker });
          this.selectedMarker.addTo(this.map);

          if (this.shouldZoomWhenSelected) this.map.zoomIn(6);
          this.map.panTo(loc);
        }
      } else {
        this.selectedMarker.remove();
        this.map.fitBounds(this.generatorsFeature.getBounds());
      }
    },
  },

  mounted() {
    this.setup();
  },

  methods: {
    setup() {
      this.map = L.map('map', {attributionControl: false}).setView([-29.186936, 143.633537], 4);
      this.generatorsFeature = L.featureGroup();
      this.emissionsFeature = L.featureGroup();
      this.tileLayer.addTo(this.map);

      const attr = L.control.attribution({
        position: 'bottomleft',
        prefix: false,
      })
      attr.addAttribution(MapAttribution);

      this.map.addControl(attr);
      // this.map.addLayer(this.selectedGeneratorFeature);

      // this.generatorsFeature.addTo(this.map);
      // this.emissionsFeature.addTo(this.map);
    },

    handleMapCircleClicked(generator) {
      this.$emit('generatorSelected', generator, false);
    },

    updateMap(data) {
      this.map.removeLayer(this.generatorsFeature);
      this.generatorsFeature = L.featureGroup();
      const self = this;

      data.forEach((d) => {
        const location = d.location;
        if (location) {
          const lat = location.latitude;
          const lng = location.longitude;

          const fillColor = d.emissionsYtd > 0 ? '#C74523' : 'green';
          const radius = d.emissionsYtd > 0 ? d.emissionsYtd / 10 : 0;
          L
            .circle([lat, lng], {
              color: '#C74523',
              fillColor: '#C74523',
              fillOpacity: 0.3,
              stroke: 2,
              radius: 1000,
            })
            .on({
              click: function() {
                self.handleMapCircleClicked(d);
              },
            })
            .bindTooltip(d.stationName)
            .addTo(this.generatorsFeature);

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