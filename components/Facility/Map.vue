<template>
  <section
    :style="{ height: mapHeight }"
    :class="{ dark: isDarkMap }"
    class="mapbox"
  >
    <client-only>
      <MglMap
        :access-token="accessToken"
        :map-style.sync="mapStyleUrl"
        :center="mapCentre"
        :zoom="3"
        class="map-container"
        @load="onMapLoaded"
        @styledata="onMapStyleDataChanged"
      >
        <button
          class="button is-small button-map-style"
          @click="showMapStyleSelector = true"
        >
          <i class="fal fa-map" />
        </button>

        <transition name="slide-down-fade">
          <MapStyleSelector
            v-if="showMapStyleSelector"
            class="map-style-selection"
            @done="showMapStyleSelector = false"
          />
        </transition>

        <MglNavigationControl position="bottom-right" />
      </MglMap>
    </client-only>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import _orderBy from 'lodash.orderby'
import _debounce from 'lodash.debounce'
import { scaleLinear as d3ScaleLinear } from 'd3-scale'
import AnimatedPopup from 'mapbox-gl-animated-popup'

import {
  MAP_STYLE_URLS,
  MAP_STYLE_SATELLITE
} from '~/constants/facilities/map-styles.js'
import MapStyleSelector from './MapStyleSelector'

const ACCESS_TOKEN = process.env.mapboxToken
const popupOptions = (openingDuration = 0, className = '') => {
  return {
    className,
    closeButton: false,
    closeOnClick: false,
    openingAnimation: {
      duration: openingDuration,
      easing: 'easeInBack'
    },
    closingAnimation: {
      duration: 0,
      easing: 'easeInBack'
    }
  }
}
const radiusScale = d3ScaleLinear([0, Math.sqrt(3000)], [3000, 10000])

export default {
  components: {
    MapStyleSelector
  },

  props: {
    data: {
      type: Array,
      default: () => []
    },
    hovered: {
      type: Object,
      default: () => null
    },
    selected: {
      type: Object,
      default: () => null
    }
  },

  data() {
    return {
      accessToken: ACCESS_TOKEN,
      mapCentre: [143.633537, -29.186936],
      windowHeight: 800,
      showMapStyleSelector: false
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      selectedMapStyle: 'facility/selectedMapStyle'
    }),

    mapHeight() {
      const offset = this.tabletBreak ? 26 : 126 + 26.5
      return `${this.windowHeight - offset}px`
    },
    mapStyleUrl() {
      return MAP_STYLE_URLS[this.selectedMapStyle]
    },
    updatedData() {
      const data = _cloneDeep(this.data)
  
      // add geojson properties to data
      data.forEach(d => {
        d.type = 'Feature'
        d.geometry = {
          type: 'Point',
          coordinates: [d.location.longitude, d.location.latitude]
        }
        d.properties = {
          colour: d.colour,
          radius: this.getRadius(d.generatorCap),
          facility_id: d.facilityId,
          displayName: d.displayName
        }
      })

      return _orderBy(data, ['generatorCap'])
    },
    isDarkMap() {
      return this.selectedMapStyle === MAP_STYLE_SATELLITE
    }
  },

  watch: {
    updatedData() {
      this.updateMapSource()
    },

    hovered(val) {
      if (
        val ||
        (this.selected && val && this.selected.facilityId !== val.facilityId)
      ) {
        this.displayPopup(val, this.popup, false)
      } else {
        this.removePopup(this.popup)
      }
    },
    selected(val) {
      if (val) {
        this.displayPopup(val, this.selectedPopup, true)
      } else {
        this.removePopup(this.selectedPopup)
        this.fitBounds()
      }
    }
  },

  created() {
    this.map = null
    this.selectedPopup = null
    this.popup = null
    this.source = null
    this.layer = null
    this.facilityJump = false
    this.bounds = new this.$mapbox.LngLatBounds()
    this.scale = new this.$mapbox.ScaleControl()
  },

  mounted() {
    if (process.client) {
      this.windowHeight = window.innerHeight
      window.addEventListener(
        'resize',
        _debounce(() => {
          this.windowHeight = window.innerHeight
        }, 200)
      )
    }
  },

  methods: {
    onMapStyleDataChanged() {
      if (!this.map.getSource('facilities')) {
        this.addMapSourceAndLayer()
      }
    },
    onMapLoaded(event) {
      this.map = event.map
      this.popup = new AnimatedPopup(popupOptions(10))
      this.selectedPopup = new AnimatedPopup(popupOptions(0, 'selected'))

      this.map.addControl(this.scale)

      this.addMapSourceAndLayer(true)

      this.map.on('mouseenter', 'facilitiesLayer', (e) => {
        this.map.getCanvas().style.cursor = 'pointer'

        const coordinates = e.features[0].geometry.coordinates.slice()
        const name = e.features[0].properties.displayName
        const id = e.features[0].properties.facility_id

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        if (coordinates) {
          if (
            !this.selected ||
            (this.selected && this.selected.facilityId !== id)
          ) {
            this.popup.setLngLat(coordinates).setHTML(name).addTo(this.map)
          }
        }
      })

      this.map.on('dblclick', 'facilitiesLayer', (e) => {
        const id = e.features[0].properties.facility_id
        this.$emit('facilityOpen', id)
      })

      this.map.on('click', 'facilitiesLayer', (e) => {
        const id = e.features[0].properties.facility_id

        if (this.selected && this.selected.facilityId === id) {
          this.$emit('facilitySelect', null)
        } else {
          this.$emit('facilitySelect', id)
        }
      })

      this.map.on('mouseleave', 'facilitiesLayer', () => {
        this.map.getCanvas().style.cursor = ''
        this.removePopup(this.popup)
      })

      this.map.on('moveend', () => {
        if (this.facilityJump) {
          this.facilityJump = false
          this.map.panBy([0, 150], { duration: 250 })
        }
      })

      if (this.selected) {
        setTimeout(() => {
          this.displayPopup(this.selected, this.selectedPopup, true)
        }, 1000)
      }
    },

    getRadius(cap) {
      return radiusScale(Math.sqrt(cap))
    },

    setMapBounds(features) {
      features.forEach((f) => {
        if (f.hasLocation) {
          this.bounds.extend([f.location.longitude, f.location.latitude])
        }
      })
    },

    getFeaturesFromData() {
      return this.updatedData
        .filter((d) => d.hasLocation)
        .map((d) => d)
    },

    updateMapSource() {
      if (this.map) {
        const features = this.getFeaturesFromData()
        this.source.data = {
          type: 'FeatureCollection',
          features
        }

        this.setMapBounds(features)
        this.map.getSource('facilities').setData(this.source.data)
        this.fitBounds()
      }
    },

    addMapSourceAndLayer(shouldFit) {
      if (this.map && this.updatedData.length > 0) {
        const features = this.getFeaturesFromData()

        this.source = {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features
          }
        }

        this.layer = {
          id: 'facilitiesLayer',
          type: 'circle',
          source: 'facilities',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              ['/', ['-', ['get', 'radius']], 1000],
              10,
              ['/', ['-', ['get', 'radius']], 250]
            ],
            'circle-opacity': 0.75,
            'circle-color': ['get', 'colour']
          }
        }

        this.setMapBounds(features)
        this.map.addSource('facilities', this.source)
        this.map.addLayer(this.layer)

        if (shouldFit) {
          this.fitBounds()
        }
      }
    },

    findPoint(point) {
      return this.updatedData.find(
        (d) =>
          d.facilityId === point.facilityId &&
          d.displayName === point.displayName
      )
    },

    displayPopup(val, ctx, flyTo) {
      const find = this.findPoint(val)
      const coordinates = find.hasLocation
        ? [find.location.longitude, find.location.latitude]
        : null
      const name = find.displayName

      if (ctx && coordinates) {
        ctx.setLngLat(coordinates).setHTML(name).addTo(this.map)

        if (flyTo) {
          this.facilityJump = true
          this.map.jumpTo({
            center: coordinates,
            zoom: 8
          })
        }
      }
    },

    fitBounds() {
      this.map.fitBounds(this.bounds, { padding: 50 })
    },

    removePopup(popup) {
      if (popup) {
        popup.remove()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mapbox {
  position: relative;
  height: 400px;

  .button-map-style {
    position: absolute;
    right: 1rem;
    top: 1rem;
    min-width: auto;
  }

  .map-style-selection {
    position: absolute;
    right: 1rem;
    top: 3.2rem;

    &::after {
      content: '';
      transform: rotate(45deg);
      background: #fff;
      top: -4px;
      right: 11px;
      width: 10px;
      height: 10px;
      position: absolute;
      z-index: 0;
    }
  }

  &.dark {
    .button-map-style {
      color: #fff;

      &:hover {
        color: #333;
      }
    }
  }
}
</style>
