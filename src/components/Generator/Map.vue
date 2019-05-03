<template>
<div>
  <div id="map" :style="{ height: mapHeight }"></div>
  <div class="attribution">
    Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.
  </div>
</div>
</template>

<script>
import _ from 'lodash';
import L from 'leaflet';
import { scaleLinear } from 'd3-scale';
import { GraphDomains } from '@/domains/graphs';

export default {
  props: {
    generatorsData: Array,
    selectedGenerator: Object,
    hoveredGenerator: Object,
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
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        shadowSize: [41, 41],
      }),
      map: null,
      selectedMarker: null,
      hoveredMarker: null,
      generatorsFeature: null,
      emissionsFeature: null,
      windowHeight: window.innerHeight,
    };
  },

  computed: {
    mapHeight() {
      return `${this.windowHeight - 100}px`;
      // return '300px';
    },
  },

  watch: {
    generatorsData(newData) {
      this.updateMap(newData);
    },
    hoveredGenerator(generator) {
      if (generator) {
        const hasLocation = generator.location;

        if (this.hoveredMarker) {
          this.hoveredMarker.remove();
        }

        if (hasLocation.latitude && hasLocation.longitude) {
          const lat = hasLocation.latitude;
          const lng = hasLocation.longitude;
          const loc = new L.LatLng(lat, lng);

          // this.hoveredMarker = L.marker([lat, lng], { icon: this.marker });
          // this.hoveredMarker.addTo(this.map);

          this.hoveredMarker = L.popup({
            autoClose: false,
            autoPan: false,
            className: 'map-popup'
          }).setLatLng([lat, lng]).setContent(generator.displayName);
          this.hoveredMarker.openOn(this.map);
        }
      } else {
        if (this.hoveredMarker) {
          this.hoveredMarker.remove();
        }
      }
    },
    selectedGenerator(generator) {
      if (generator) {
        const hasLocation = generator.location;

        if (this.selectedMarker) {
          this.selectedMarker.remove();
        }

        if (hasLocation.latitude && hasLocation.longitude) {
          const lat = hasLocation.latitude;
          const lng = hasLocation.longitude;
          const loc = new L.LatLng(lat, lng);

          // this.selectedMarker = L.marker([lat, lng], { icon: this.marker });
          // this.selectedMarker.addTo(this.map);
          this.selectedMarker = L.popup({
            autoClose: false,
            closeOnClick: false,
            className: 'map-popup selected'
          }).setLatLng([lat, lng]).setContent(generator.displayName);
          this.selectedMarker.openOn(this.map);

          this.map.setZoom(7);
          this.map.on('zoomend', () => {
            this.map.panTo(loc);
          });
          this.map.panTo(loc);
        }
      } else {
        this.selectedMarker.remove();
        // this.map.fitBounds(this.generatorsFeature.getBounds());
      }
    },
  },

  mounted() {
    this.setup();
  },

  methods: {
    setup() {
      this.map = L.map('map', { attributionControl: false, maxZoom: 7 }).setView([-29.186936, 143.633537], 4);
      this.generatorsFeature = L.featureGroup();
      this.emissionsFeature = L.featureGroup();
      this.tileLayer.addTo(this.map);

      const attr = L.control.attribution({
        position: 'bottomleft',
        prefix: false,
      });
      // attr.addAttribution(MapAttribution);

      this.map.addControl(attr);
      // this.map.addLayer(this.selectedGeneratorFeature);

      // this.generatorsFeature.addTo(this.map);
      // this.emissionsFeature.addTo(this.map);
    },

    handleMapCircleClicked(generator) {
      this.$emit('generatorSelected', generator, false);
    },

    getColour(fuelTechs) {
      const ftObj = fuelTechs[0] ? GraphDomains[fuelTechs[0]] : null;
      if (ftObj) {
        return ftObj.colour;
      }
      return 'black';
    },

    selectedGeneratorBounds() {
      const lat = this.selectedMarker._latlng.lat;
      const lng = this.selectedMarker._latlng.lng;
      const loc = new L.LatLng(lat, lng);
      this.map.panTo(loc);
    },

    updateMap(data) {
      this.map.removeLayer(this.generatorsFeature);
      this.generatorsFeature = L.featureGroup();
      const self = this;
      data.forEach((d) => {
        const location = d.location;
        if (location.latitude && location.longitude) {
          const lat = location.latitude;
          const lng = location.longitude;
          const radiusScale = scaleLinear([0, 3000], [2000, 50000]);
          const radius = radiusScale(d.generatorCap);
          const colour = this.getColour(d.fuelTechs);
          L
            .circle([lat, lng], {
              color: colour,
              fillColor: colour,
              fillOpacity: 0.25,
              stroke: 3,
              radius,
            })
            .on({
              click() {
                self.handleMapCircleClicked(d);
              },
            })
            .bindTooltip(d.displayName)
            .addTo(this.generatorsFeature);

          L.circle([lat, lng], {
            fillColor: colour,
            fillOpacity: 0.3,
            stroke: 0,
            radius,
          }).addTo(this.emissionsFeature);
        }
      });

      this.map.addLayer(this.generatorsFeature);

      const bounds = this.generatorsFeature.getBounds();
      if (!_.isEmpty(bounds)) {
        this.map.fitBounds(this.generatorsFeature.getBounds());
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

#map {
  width: 100%;
  height: 200px;
  z-index: 1;
  border-radius: 6px;
  // box-shadow: 0 0 20px rgba(0,0,0,.05);
  opacity: 0.95;
}

.attribution {
  font-size: 9px;
  text-align: center;
  opacity: 0.75;
}
</style>