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

  <totals
    v-if="widthBreak"
    :position="'fixed'"
    :div-width="divWidth"
    :total-facilities="totalFacilities"
    :total-cap="totalCap"
  />
</div>
</template>

<script>
import _ from 'lodash';
import L from 'leaflet';
import { scaleLinear } from 'd3-scale';
import { GraphDomains } from '@/domains/graphs';
import TileSelector from './MapTileSelector';
import Totals from './Totals';

export default {
  components: {
    TileSelector,
    Totals,
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
        terrain: L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
          minZoom: 0,
          maxZoom: 18,
          ext: 'png',
        }),
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
      divWidth: 0,
    };
  },

  computed: {
    widthBreak() {
      return window.innerWidth < 769;
    },

    mapHeight() {
      const offset = this.widthBreak ? 140 : 155;
      return `${this.windowHeight - offset}px`;
    },

    facilitySelectedTechs() {
      return this.$store.getters.facilitySelectedTechs;
    },

    totalFacilities() {
      return this.facilitiesData.length;
    },

    totalCap() {
      let total = 0;
      this.facilitiesData.forEach((facility) => {
        if (this.facilitySelectedTechs.length === 0) {
          total += facility.generatorCap;
        } else {
          this.facilitySelectedTechs.forEach((ft) => {
            if (facility.fuelTechRegisteredCap[ft]) {
              total += facility.fuelTechRegisteredCap[ft];
            }
          });
        }
      });
      return total;
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
      const sorted = _.orderBy(newData, [this.getGeneratorCap], ['desc']);
      this.updateMap(sorted);
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

          this.selectedMarker = L.popup({
            autoClose: false,
            autoPan: false,
            closeOnClick: false,
            className: 'map-popup selected',
          }).setLatLng([lat, lng]).setContent(facility.displayName);
          this.selectedMarker.openOn(this.map);

          if (this.map.getZoom() < 7) {
            this.map.setZoom(7);
            this.map.panTo(loc);
          }
        }
      } else if (this.selectedMarker) {
        this.selectedMarker.remove();
        // const bounds = this.facilitiesFeature.getBounds();
        // if (!_.isEmpty(bounds)) {
        //   this.map.fitBounds(this.facilitiesFeature.getBounds());
        // }
      }
    },
  },

  mounted() {
    this.setup();
    this.updateMap(this.facilitiesData);
    this.divWidth = this.$el.offsetWidth;

    window.addEventListener('resize', _.debounce(() => {
      this.divWidth = this.$el.offsetWidth;
    }, 200));
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

      this.map.addControl(attr);
      this.map.addControl(zoom);
    },

    handleMapCircleClicked(facility) {
      this.$emit('facilitySelect', facility, false);
    },

    getColour(fuelTechs, facility) {
      const ftCaps = facility.fuelTechRegisteredCap;
      let highest = 0;
      let highestFt = null;
      Object.keys(ftCaps).forEach((d) => {
        if (this.facilitySelectedTechs.length) {
          const included = _.includes(this.facilitySelectedTechs, d);
          if (included) {
            if (ftCaps[d] >= highest) {
              highestFt = d;
              highest = ftCaps[d];
            }
          }
        } else if (ftCaps[d] >= highest) {
          highestFt = d;
          highest = ftCaps[d];
        }
      });

      const ftObj = highestFt ? GraphDomains[highestFt] : null;
      if (ftObj) {
        return ftObj.colour;
      }
      return 'black';
    },

    getGeneratorCap(facility) {
      if (this.facilitySelectedTechs.length === 0) {
        return facility.generatorCap;
      }

      let cap = 0;
      this.facilitySelectedTechs.forEach((d) => {
        if (GraphDomains[d].type !== 'loads' && facility.fuelTechRegisteredCap[d]) {
          cap += facility.fuelTechRegisteredCap[d];
        }
      });
      return cap;
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
          const radius = radiusScale(Math.sqrt(this.getGeneratorCap(d)));
          const colour = this.getColour(d.fuelTechs, d);
          L
            .circle([lat, lng], {
              color: colour,
              fillColor: colour,
              fillOpacity: 0.55,
              opacity: 0.95,
              weight: 1,
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
              mouseout() {
                if (self.hoveredMarker) {
                  self.hoveredMarker.remove();
                }
              },
            })
            .addTo(this.facilitiesFeature);
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