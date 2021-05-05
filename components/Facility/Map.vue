<template>
  <section
    :style="{ height: mapHeight }"
    class="mapbox">
    <client-only>
      <!-- <div 
        ref="mapboxContainer" 
        style="height: 300px;" /> -->
      <MglMap
        :access-token="accessToken"
        :map-style="mapStyle"
        :center="mapCentre"
        :zoom="4"
        class="map-container"
        @load="onMapLoaded">


        <MglNavigationControl
          position="bottom-right"
        />

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
import { DEFAULT_FUEL_TECH_COLOUR } from '~/constants/energy-fuel-techs/group-default.js'

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
    },
    mapStyle: {
      type: String,
      default: 'mapbox://styles/mapbox/light-v10?optimize=true'
    }
  },

  data() {
    return {
      accessToken: ACCESS_TOKEN,
      mapCentre: [143.633537, -29.186936],
      windowHeight: 800
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak'
    }),
    mapHeight() {
      const offset = this.tabletBreak ? 49 : 75
      return `${this.windowHeight - offset}px`
    },
    updatedData() {
      // @TODO: move this out of component
      const data = _cloneDeep(this.data)
      data.forEach(d => {
        const properties = d.jsonData.properties
        properties.generatorCap = d.generatorCap
        properties.colour = this.getColour(d)
        properties.radius = this.radiusScale(Math.sqrt(d.generatorCap))
        if (d.displayName === 'Berwick') {
          console.log(properties.radius)
        }
        if (d.displayName === 'Bayswater') {
          console.log(properties.radius)
        }
      })
      return _orderBy(data, ['generatorCap'], ['desc'])
    }
  },

  watch: {
    data() {
      // this.updateMap()
    },
    hovered(val) {
      if (
        val ||
        (this.selected && val && this.selected.facilityId !== val.facilityId)
      ) {
        this.displayPopup(val, this.popup, false)
      }
    },
    selected(val) {
      if (val) {
        this.displayPopup(val, this.selectedPopup, true)
      } else {
        this.selectedPopup.remove()
        this.fitBounds()
      }
    }
  },

  created() {
    this.map = null
    this.selectedPopup = null
    this.popup = null
    this.bounds = new this.$mapbox.LngLatBounds()
    this.radiusScale = d3ScaleLinear([0, Math.sqrt(3000)], [1000, 10000])
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
    onMapLoaded(event) {
      this.map = event.map
      this.popup = new AnimatedPopup(popupOptions(10))
      this.selectedPopup = new AnimatedPopup(popupOptions(0, 'selected'))

      this.updateMap()

      this.map.on('mouseenter', 'facilitiesLayer', e => {
        this.map.getCanvas().style.cursor = 'pointer'

        const coordinates = e.features[0].geometry.coordinates.slice()
        const name = e.features[0].properties.name

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        if (coordinates) {
          this.popup
            .setLngLat(coordinates)
            .setHTML(name)
            .addTo(this.map)
        }
      })

      this.map.on('mouseleave', 'facilitiesLayer', () => {
        this.map.getCanvas().style.cursor = ''
        this.popup.remove()
      })
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

    updateMap() {
      if (this.map && this.updatedData.length > 0) {
        const features = this.updatedData.map(d => d.jsonData)

        features.forEach(f => {
          if (f.geometry && f.geometry.coordinates) {
            this.bounds.extend(f.geometry.coordinates)
          }
        })

        this.map.addSource('facilities', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features
          }
        })

        this.map.addLayer({
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
        })

        this.fitBounds()
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
    }
  }
}
</script>

<style lang="scss" scoped>
.mapbox {
  position: relative;
  height: 400px;
}
</style>
