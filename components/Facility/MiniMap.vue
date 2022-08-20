<template>
  <section
    :style="{ height: coordinates ? `${height}px` : '' }"
    :class="{
      'full-screen': isFullScreen,
      dark: isDark
    }"
    class="mapbox"
    @click.self="handleExpandClick"
  >
    <client-only>
      <transition name="fade">
        <MglMap
          v-if="hasLocation"
          :access-token="accessToken"
          :map-style.sync="mapStyle"
          :zoom="zoom"
          :center="coordinates"
          class="map-container"
          @load="onMapLoaded"
          @click.self="isFullScreen ? () => {} : handleExpandClick()"
        >
          <div 
            v-if="enableMeasure && distance > 0" 
            class="distance">
            {{ distance | formatValue }}km
          </div>

          <button
            v-if="isFullScreen"
            :class="{ 'is-primary': enableMeasure }"
            class="button is-small button-measure"
            @click="enableMeasure = !enableMeasure"
          >
            <i class="fal fa-ruler-combined" />
          </button>

          <MglMarker
            v-if="showMarker || isFullScreen"
            :coordinates="coordinates"
            color="#e34a33"
          />

          <MglNavigationControl 
            v-if="isFullScreen" 
            position="bottom-right" />
        </MglMap>
      </transition>
      <button
        v-tooltip.left-start="isFullScreen ? 'Exit full screen' : 'Full screen'"
        class="expand-button"
        @click="handleExpandClick"
      >
        <i 
          v-if="isFullScreen" 
          class="fal fa-compress" />
        <i 
          v-else 
          class="fal fa-expand" />
      </button>
    </client-only>

    <transition name="fade">
      <div 
        v-if="!hasLocation" 
        class="not-found-card card">
        <i class="fal fa-map-marker-alt" />
        <span>Location not available</span>
      </div>
    </transition>
  </section>
</template>

<script>
import turfLength from '@turf/length'

const ACCESS_TOKEN = process.env.mapboxToken

export default {
  props: {
    hasLocation: {
      type: Boolean,
      default: false
    },
    height: {
      type: Number,
      default: 200
    },
    point: {
      type: Object,
      default: () => null
    },
    boundary: {
      type: Object,
      default: () => null
    },
    zoom: {
      type: Number,
      default: 4
    },
    mapStyle: {
      type: String,
      default: 'mapbox://styles/mapbox/streets-v11?optimize=true'
    },
    showMarker: {
      type: Boolean,
      default: true
    },
    fitBounds: {
      type: Boolean,
      default: true
    },
    isDark: {
      type: Boolean,
      default: false
    }
  },

  // map styles
  // mapbox://styles/mapbox/light-v10
  // mapbox://styles/mapbox/satellite-v9
  // streets-v11
  data() {
    return {
      accessToken: ACCESS_TOKEN,
      isFullScreen: false,
      enableMeasure: false,
      distance: 0
    }
  },

  computed: {
    coordinates() {
      return this.point ? this.point.coordinates : null
    },

    bounds() {
      if (!this.boundary) return null

      const coordinates = this.boundary.coordinates[0]
      return coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord)
      }, new this.$mapbox.LngLatBounds(coordinates[0], coordinates[0]))
    },

    collection() {
      const collection = {
        type: 'FeatureCollection',
        features: []
      }

      if (this.boundary) {
        collection.features.push({
          type: 'Feature',
          geometry: this.boundary
        })
      }

      return collection
    }
  },

  watch: {
    enableMeasure(val) {
      if (!val) {
        this.resetMeasurements()
      }
    }
  },

  created() {
    this.map = null
    this.scale = new this.$mapbox.ScaleControl()
    this.measurements = null
    this.lineString = null

    this.setupMeasurementsAndLineString()
  },

  methods: {
    onMapLoaded(event) {
      this.map = event.map
      this.map.addControl(this.scale)
      this.addFeaturesSourceLayer()
      this.addMeasurementSourceLayer()
      this.disableMapInteractions()
      this.setupMapEvents()

      if (this.bounds && this.fitBounds) {
        this.map.fitBounds(this.bounds, this.getBBoxOptions())
      }
    },

    resetMeasurements() {
      this.map.getCanvas().style.cursor = 'pointer'
      this.setupMeasurementsAndLineString()
      this.map.getSource('measurements').setData(this.measurements)
    },

    setupMapEvents() {
      this.map.on('click', (e) => {
        if (this.enableMeasure) {
          const features = this.map.queryRenderedFeatures(e.point, {
            layers: ['measure-points']
          })

          if (this.measurements.features.length > 1) {
            this.measurements.features.pop()
          }

          if (features.length) {
            var id = features[0].properties.id
            this.measurements.features = this.measurements.features.filter(
              function (point) {
                return point.properties.id !== id
              }
            )
          } else {
            var point = {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [e.lngLat.lng, e.lngLat.lat]
              },
              properties: {
                id: String(new Date().getTime())
              }
            }

            this.measurements.features.push(point)
          }

          if (this.measurements.features.length > 1) {
            this.lineString.geometry.coordinates =
              this.measurements.features.map(function (point) {
                return point.geometry.coordinates
              })

            this.measurements.features.push(this.lineString)
          } else {
            this.lineString.geometry.coordinates = []
          }

          this.map.getSource('measurements').setData(this.measurements)

          const dist = turfLength(this.lineString).toLocaleString() + 'km'
          this.distance = turfLength(this.lineString)
          console.log(dist, turfLength(this.lineString))
        }
      })

      this.map.on('mousemove', (e) => {
        if (this.enableMeasure) {
          var features = this.map.queryRenderedFeatures(e.point, {
            layers: ['measure-points']
          })
          // UI indicator for clicking/hovering a point on the map
          this.map.getCanvas().style.cursor = features.length
            ? 'pointer'
            : 'crosshair'
        }
      })
    },

    addMeasurementSourceLayer() {
      this.map.addSource('measurements', {
        type: 'geojson',
        data: this.measurements
      })
      this.map.addLayer({
        id: 'measure-points',
        type: 'circle',
        source: 'measurements',
        paint: {
          'circle-radius': 5,
          'circle-color': '#c74523'
        },
        filter: ['in', '$type', 'Point']
      })
      this.map.addLayer({
        id: 'measure-lines',
        type: 'line',
        source: 'measurements',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#c74523',
          'line-width': 1.5
        },
        filter: ['in', '$type', 'LineString']
      })
    },

    addFeaturesSourceLayer() {
      this.map.addSource('features', {
        type: 'geojson',
        data: this.collection
      })

      this.map.addLayer({
        id: 'polygon-fill',
        type: 'fill',
        source: 'features',
        layout: {},
        paint: {
          'fill-color': '#e34a33',
          'fill-opacity': 0.2
        }
      })
      this.map.addLayer({
        id: 'polygon-line',
        type: 'line',
        source: 'features',
        layout: {},
        paint: {
          'line-color': '#e34a33',
          'line-width': 1
        }
      })
    },

    setupMeasurementsAndLineString() {
      this.distance = 0
      this.measurements = {
        type: 'FeatureCollection',
        features: []
      }
      this.lineString = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    },

    disableMapInteractions() {
      this.map.removeControl(this.scale)

      this.map.boxZoom.disable()
      this.map.scrollZoom.disable()
      this.map.dragPan.disable()
      this.map.dragRotate.disable()
      this.map.keyboard.disable()
      this.map.doubleClickZoom.disable()
      this.map.touchZoomRotate.disable()
      this.map.touchPitch.disable()
    },

    enableMapInteractions() {
      this.map.addControl(this.scale)

      this.map.boxZoom.enable()
      this.map.scrollZoom.enable()
      this.map.dragPan.enable()
      this.map.dragRotate.enable()
      this.map.keyboard.enable()
      this.map.doubleClickZoom.enable()
      this.map.touchZoomRotate.enable()
      this.map.touchPitch.enable()
    },

    backToPoint() {
      if (this.bounds && this.fitBounds) {
        this.map.fitBounds(this.bounds, this.getBBoxOptions(false))
      } else {
        this.map.flyTo({
          center: this.coordinates,
          zoom: this.zoom,
          bearing: 0
        })
      }
    },

    getBBoxOptions(linear = true) {
      return { padding: 5, linear }
    },

    handleExpandClick() {
      this.isFullScreen = !this.isFullScreen
      this.enableMeasure = false

      if (this.isFullScreen) {
        this.enableMapInteractions()
      } else {
        this.disableMapInteractions()
      }

      setTimeout(() => {
        this.map.resize()
        setTimeout(() => {
          if (this.isFullScreen) {
            this.map.zoomIn()
          } else {
            this.backToPoint()
          }
        }, 10)
      }, 10)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';

.expand-button {
  position: absolute;
  top: 10px;
  right: 5px;
  z-index: 2;
  background: transparent;
  border: none;
  cursor: pointer;

  &:active,
  &:focus {
    border: none;
    outline: none;
  }

  i {
    color: #fff;
    font-size: 18px;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.6);
  }
}
.mapbox {
  position: relative;

  &.full-screen {
    position: fixed;
    z-index: 9999;
    left: 0;
    right: 0;
    top: 0;
    bottom: -2px;
    padding: 6rem;
    background: rgb(0, 0, 0);
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );

    height: auto !important;

    @include mobile {
      padding: 4rem 1rem 1rem;
    }

    .map-container {
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
    }

    .expand-button {
      top: 2.5rem;
      right: 6rem;

      @include mobile {
        top: 20px;
        right: 15px;
      }
    }
  }

  .button-measure {
    position: absolute;
    right: 1rem;
    top: 1rem;
    min-width: auto;
  }
  .distance {
    position: absolute;
    top: 3rem;
    left: calc(50% - 1rem);
    background-color: rgba(0, 0, 0, 0.75);
    color: #fff;
    padding: 0.2rem 0.5rem;
    font-size: 16px;
    border-radius: 4px;
  }

  &.dark {
    .distance {
      background-color: rgba(255, 255, 255, 0.9);
      color: #000;
    }
  }

  :deep(.mapboxgl-canvas) {
    border-radius: 10px;
    outline: none;
  }
  :deep(.mapboxgl-ctrl-logo) {
    transform: scale(0.75);
    position: relative;
    left: -10px;
  }
  :deep(.mapboxgl-ctrl-attrib.mapboxgl-compact) {
    padding: 0;
  }
  :deep(.mapboxgl-ctrl-attrib.mapboxgl-compact-show .mapboxgl-ctrl-attrib-inner) {
    position: relative;
    right: 25px;
    background-color: #fff;
    padding-left: 10px;
    border-radius: 20px;
  }
  :deep(.mapboxgl-ctrl-attrib-button) {
    background-repeat: no-repeat;
    background-color: transparent;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='20' height='20' viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='white' d='M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-36 344h12V232h-12c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12h48c6.627 0 12 5.373 12 12v140h12c6.627 0 12 5.373 12 12v8c0 6.627-5.373 12-12 12h-72c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12zm36-240c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z'/%3E%3C/svg%3E");

    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    top: auto;
  }
  :deep(.mapboxgl-ctrl-attrib-button[aria-pressed='true']) {
    background-repeat: no-repeat;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='20' height='20' viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-36 344h12V232h-12c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12h48c6.627 0 12 5.373 12 12v140h12c6.627 0 12 5.373 12 12v8c0 6.627-5.373 12-12 12h-72c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12zm36-240c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z'/%3E%3C/svg%3E");
  }
  :deep(.mapboxgl-ctrl.mapboxgl-ctrl-attrib) {
    border-radius: 10px;
    min-height: auto;
  }
}
</style>
