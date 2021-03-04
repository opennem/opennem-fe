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
  ::v-deep .mapboxgl-ctrl-attrib.mapboxgl-compact {
    padding: 0;
  }
  ::v-deep
    .mapboxgl-ctrl-attrib.mapboxgl-compact-show
    .mapboxgl-ctrl-attrib-inner {
    position: relative;
    right: 25px;
    background-color: #fff;
    padding-left: 10px;
    border-radius: 20px;
  }
  ::v-deep .mapboxgl-ctrl-attrib-button {
    background-color: transparent;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='20' height='20' viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='white' d='M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-36 344h12V232h-12c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12h48c6.627 0 12 5.373 12 12v140h12c6.627 0 12 5.373 12 12v8c0 6.627-5.373 12-12 12h-72c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12zm36-240c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z'/%3E%3C/svg%3E");

    width: 20px;
    height: 20px;
  }
  ::v-deep .mapboxgl-ctrl-attrib-button[aria-pressed='true'] {
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='20' height='20' viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-36 344h12V232h-12c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12h48c6.627 0 12 5.373 12 12v140h12c6.627 0 12 5.373 12 12v8c0 6.627-5.373 12-12 12h-72c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12zm36-240c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z'/%3E%3C/svg%3E");
  }
}
</style>
