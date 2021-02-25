<template>
  <section
    :style="{ height: hasLocation ? `${height}px` : '' }"
    class="mapbox">
    <client-only>
      <transition name="fade">
        <MglMap
          v-if="hasCoordinates"
          :access-token="accessToken"
          :map-style="mapStyle"
          :center="coordinates"
          :zoom="zoom"
          @load="onMapLoaded" >
          <MglMarker
            v-if="showMarker"
            :coordinates="coordinates"
            color="#e34a33" />
        </MglMap>
      </transition>
    </client-only>

    <transition name="fade">
      <div
        v-if="!hasLocation"
        class="not-found-card card">
        <i class="fal fa-map-marker-alt"/>
        <span>Location not available</span>
      </div>
    </transition>
  </section>
</template>

<script>
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
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    },
    zoom: {
      type: Number,
      default: 4
    },
    mapStyle: {
      type: String,
      default: 'mapbox://styles/mapbox/light-v10'
    },
    showMarker: {
      type: Boolean,
      default: true
    }
  },

  // map styles
  // mapbox://styles/mapbox/light-v10
  // mapbox://styles/mapbox/satellite-v9
  data() {
    return {
      accessToken: ACCESS_TOKEN
    }
  },

  computed: {
    hasCoordinates() {
      return this.lat && this.lng
    },
    coordinates() {
      return [this.lng, this.lat]
    }
  },

  methods: {
    async onMapLoaded(event) {
      const asyncActions = event.component.actions
      const map = event.map

      // disable all interactions
      map.boxZoom.disable()
      map.scrollZoom.disable()
      map.dragPan.disable()
      map.dragRotate.disable()
      map.keyboard.disable()
      map.doubleClickZoom.disable()
      map.touchZoomRotate.disable()
      map.touchPitch.disable()
    }
  }
}
</script>

<style lang="scss" scoped>
.mapbox {
  ::v-deep .mapboxgl-canvas {
    border-radius: 10px;
    outline: none;
  }
  ::v-deep .mapboxgl-ctrl-logo {
    transform: scale(0.75);
    position: relative;
    left: -10px;
  }
}
</style>
