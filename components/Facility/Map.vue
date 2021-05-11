<template>
  <section
    :style="{ height: mapHeight }"
    :class="{ dark: isDarkMap }"
    class="mapbox">
    <client-only>
      <MglMap
        :access-token="accessToken"
        :map-style.sync="mapStyleUrl"
        :center="mapCentre"
        :zoom="3"
        class="map-container"
        @load="onMapLoaded"
        @styledata="onMapStyleDataChanged">

        <div class="map-style-selection">
          <span><i class="fal fa-layer-group"/></span>
          <div class="select is-rounded is-small">
            <select v-model="selectedMapStyle">
              <option 
                v-for="(d, i) in mapStyleSelections" 
                :key="i" 
                :value="d.value">{{ d.label }}</option>
            </select>
          </div>
        </div>

        <MglNavigationControl
          position="bottom-right"
        />
      </MglMap>
    </client-only>
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import _cloneDeep from 'lodash.clonedeep'
import _orderBy from 'lodash.orderby'
import _debounce from 'lodash.debounce'
import { scaleLinear as d3ScaleLinear } from 'd3-scale'
import AnimatedPopup from 'mapbox-gl-animated-popup'

import { DEFAULT_FUEL_TECH_COLOUR } from '~/constants/energy-fuel-techs/group-default.js'
import {
  mapStyleSelections,
  MAP_STYLE_URLS,
  MAP_STYLE_LIGHT,
  MAP_STYLE_SATELLITE
} from '~/constants/facilities/map-styles.js'

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
const radiusScale = d3ScaleLinear([0, Math.sqrt(3000)], [1000, 10000])

export default {
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
      mapStyleSelections
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak'
    }),
    selectedMapStyle: {
      get() {
        return this.$store.getters['facility/selectedMapStyle']
      },
      set(val) {
        this.setSelectedMapStyle(val)
      }
    },
    mapHeight() {
      const offset = this.tabletBreak ? 49 : 50
      return `${this.windowHeight - offset}px`
    },
    mapStyleUrl() {
      return MAP_STYLE_URLS[this.selectedMapStyle]
    },
    updatedData() {
      // @TODO: move this out of component
      const data = _cloneDeep(this.data)
      data.forEach(d => {
        const properties = d.jsonData.properties
        properties.generatorCap = d.generatorCap
        properties.colour = this.getColour(d)
        properties.radius = this.getRadius(d.generatorCap)
      })
      return _orderBy(data, ['generatorCap'], ['desc'])
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
    ...mapMutations({
      setSelectedMapStyle: 'facility/selectedMapStyle'
    }),
    onMapStyleDataChanged() {
      if (!this.map.getSource('facilities')) {
        this.addMapSourceAndLayer()
      }
    },
    onMapLoaded(event) {
      console.log('load')
      this.map = event.map
      this.popup = new AnimatedPopup(popupOptions(10))
      this.selectedPopup = new AnimatedPopup(popupOptions(0, 'selected'))

      this.map.addControl(this.scale)

      this.addMapSourceAndLayer(true)

      this.map.on('mouseenter', 'facilitiesLayer', e => {
        this.map.getCanvas().style.cursor = 'pointer'

        const coordinates = e.features[0].geometry.coordinates.slice()
        const name = e.features[0].properties.name
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
            this.popup
              .setLngLat(coordinates)
              .setHTML(name)
              .addTo(this.map)
          }
        }
      })

      this.map.on('click', 'facilitiesLayer', e => {
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

      if (this.selected) {
        this.displayPopup(this.selected, this.selectedPopup, true)
      }
    },

    getRadius(cap) {
      return radiusScale(Math.sqrt(cap))
    },

    getColour(facility) {
      const ftCaps = facility.fuelTechRegisteredCap
      let highest = 0
      let highestFt = null
      Object.keys(ftCaps).forEach(d => {
        if (ftCaps[d] >= highest) {
          highestFt = d
          highest = ftCaps[d]
        }
      })

      const ftColour = DEFAULT_FUEL_TECH_COLOUR[highestFt]
      return ftColour || 'lightgrey'
    },

    setMapBounds(features) {
      features.forEach(f => {
        if (f.geometry && f.geometry.coordinates) {
          this.bounds.extend(f.geometry.coordinates)
        }
      })
    },

    getFeaturesFromData() {
      return this.updatedData.map(d => d.jsonData)
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
              ['/', ['-', ['get', 'radius']], 500],
              10,
              ['/', ['-', ['get', 'radius']], 100]
            ],
            'circle-opacity': 0.75,
            'circle-color': ['get', 'colour'],
            'circle-stroke-color': ['get', 'colour'],
            'circle-stroke-width': 2
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
        d =>
          d.facilityId === point.facilityId &&
          d.displayName === point.displayName
      )
    },

    displayPopup(val, ctx, flyTo) {
      const find = this.findPoint(val)
      const coordinates = find.jsonData.geometry
        ? find.jsonData.geometry.coordinates.slice()
        : null
      const name = find.displayName

      if (ctx && coordinates) {
        ctx
          .setLngLat(coordinates)
          .setHTML(name)
          .addTo(this.map)

        if (flyTo) {
          this.map.flyTo({
            center: coordinates,
            zoom: 8,
            speed: 1.8,
            curve: 1.8
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

  .map-style-selection {
    position: absolute;
    right: 1rem;
    top: 1rem;
    span {
      position: relative;
      top: 4px;
      right: 4px;
    }

    select {
      background-color: rgba(255, 255, 255, 0.75);
    }
  }

  &.dark {
    .map-style-selection span,
    select {
      color: #ccc;
    }
    select {
      background-color: rgba(0, 0, 0, 0.75);
    }
    .select:not(.is-multiple):not(.is-loading)::after {
      border-color: #ccc;
    }
  }
}
</style>
