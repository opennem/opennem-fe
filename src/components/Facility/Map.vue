<template>
<div>
  <tile-selector
    class="tile-selector"
    :tile="selectedTile"
    @tileSelect="handleTileSelect"
  />
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
import TileSelector from './MapTileSelector';

export default {
  components: {
    TileSelector,
  },
  props: {
    facilitiesData: Array,
    selectedFacility: Object,
    hoveredFacility: Object,
    shouldZoomWhenSelected: Boolean,
  },

  data() {
    return {
      tileLayers: {
        'toner-lite': L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
          minZoom: 0,
          maxZoom: 18,
          ext: 'png',
        }),
        'terrain': L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
          minZoom: 0,
          maxZoom: 18,
          ext: 'png',
        })
      },
      selectedTile: 'toner-lite',
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
      facilitiesFeature: null,
      emissionsFeature: null,
      windowHeight: window.innerHeight,
    };
  },

  computed: {
    mapHeight() {
      return `${this.windowHeight - 175}px`;
    },
  },

  watch: {
    selectedTile(tile) {
      Object.keys(this.tileLayers).forEach((layer) => {
        this.tileLayers[layer].remove();
      });
      this.tileLayers[tile].addTo(this.map);
    },
    facilitiesData(newData) {
      this.updateMap(newData);
    },
    hoveredFacility(facility) {
      if (facility) {
        const hasLocation = facility.location;

        if (this.hoveredMarker) {
          this.hoveredMarker.remove();
        }

        if (hasLocation.latitude && hasLocation.longitude) {
          const lat = hasLocation.latitude;
          const lng = hasLocation.longitude;

          this.hoveredMarker = L.popup({
            autoClose: false,
            autoPan: false,
            className: 'map-popup',
          }).setLatLng([lat, lng]).setContent(facility.displayName);

          this.hoveredMarker.openOn(this.map);
        }
      } else if (this.hoveredMarker) {
        this.hoveredMarker.remove();
      }
    },
    selectedFacility(facility) {
      if (facility) {
        const hasLocation = facility.location;

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
            autoPan: false,
            closeOnClick: false,
            className: 'map-popup selected',
          }).setLatLng([lat, lng]).setContent(facility.displayName);
          this.selectedMarker.openOn(this.map);

          this.map.setZoom(7);
          // this.map.on('zoomend', () => {
          //   console.log('zoom end')
          //   this.map.panTo(loc);
          //   this.map.off('zoomend');
          // });
          this.map.panTo(loc);
        }
      } else if (this.selectedMarker) {
        this.selectedMarker.remove();
        // this.map.off('zoomend');
        const bounds = this.facilitiesFeature.getBounds();
        if (!_.isEmpty(bounds)) {
          this.map.fitBounds(this.facilitiesFeature.getBounds());
        }
      }
    },
  },

  mounted() {
    this.setup();
  },

  methods: {
    setup() {
      this.map = L.map('map', {
        attributionControl: false,
        maxZoom: 10,
        zoomAnimation: false,
        zoomControl: false,
      }).setView([-29.186936, 143.633537], 4);
      this.facilitiesFeature = L.featureGroup();
      this.emissionsFeature = L.featureGroup();
      this.tileLayers[this.selectedTile].addTo(this.map);

      const attr = L.control.attribution({
        position: 'bottomleft',
        prefix: false,
      });
      const zoom = L.control.zoom({
        position: 'topright',
      });
      
      // attr.addAttribution(MapAttribution);

      this.map.addControl(attr);
      this.map.addControl(zoom);
      // this.map.addLayer(this.selectedFacilityFeature);

      // this.facilitiesFeature.addTo(this.map);
      // this.emissionsFeature.addTo(this.map);
    },

    handleMapCircleClicked(facility) {
      this.$emit('facilitySelect', facility, false);
    },

    getColour(fuelTechs) {
      const ftObj = fuelTechs[0] ? GraphDomains[fuelTechs[0]] : null;
      if (ftObj) {
        return ftObj.colour;
      }
      return 'black';
    },

    selectedFacilityBounds() {
      const lat = this.selectedMarker._latlng.lat; // eslint-disable-line
      const lng = this.selectedMarker._latlng.lng; // eslint-disable-line
      const loc = new L.LatLng(lat, lng);
      this.map.panTo(loc);
    },

    handleTileSelect(tile) {
      this.selectedTile = tile;
    },

    updateMap(data) {
      this.map.removeLayer(this.facilitiesFeature);
      this.facilitiesFeature = L.featureGroup();
      const self = this;
      data.forEach((d) => {
        const location = d.location;
        if (location.latitude && location.longitude) {
          const lat = location.latitude;
          const lng = location.longitude;
          const radiusScale = scaleLinear([0, Math.sqrt(3000)], [2000, 50000]);
          const radius = radiusScale(Math.sqrt(d.generatorCap));
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
              mouseover() {
                if (self.hoveredMarker) {
                  self.hoveredMarker.remove();
                }

                self.hoveredMarker = L.popup({
                  autoClose: false,
                  autoPan: false,
                  className: 'map-popup',
                }).setLatLng([lat, lng]).setContent(d.displayName);

                self.hoveredMarker.openOn(self.map);
              },
            })
            .addTo(this.facilitiesFeature);
            // .bindTooltip(d.displayName)

          L.circle([lat, lng], {
            fillColor: colour,
            fillOpacity: 0.3,
            stroke: 0,
            radius,
          }).addTo(this.emissionsFeature);
        }
      });

      this.map.addLayer(this.facilitiesFeature);

      const bounds = this.facilitiesFeature.getBounds();
      if (!_.isEmpty(bounds)) {
        this.map.fitBounds(this.facilitiesFeature.getBounds());
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
  border-radius: 2px;
  // box-shadow: 0 0 20px rgba(0,0,0,.05);
  opacity: 0.95;
}

.tile-selector {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 9;
}

.attribution {
  font-size: 9px;
  text-align: center;
  opacity: 0.75;
}
</style>