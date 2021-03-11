<template>
  <div :class="layout">
    <Photos
      :has-photos="facilityPhotos.length > 0"
      :photos="facilityPhotos"
      :name="facilityName"
      :height="layout === 'aside' ? 'auto' : '200px'"/>

    <MiniMap
      :has-location="hasLocation"
      :boundary="facilityLocation.boundary"
      :point="facilityLocation.geom"
      :fit-bounds="false"
      class="map" />

    <MiniMap
      :has-location="hasLocation"
      :zoom="13"
      :boundary="facilityLocation.boundary"
      :point="facilityLocation.geom"
      :map-style="'mapbox://styles/mapbox/satellite-streets-v11'"
      :show-marker="false"
      class="map" />

      <!-- <MetaInfo
          :facility-id="facilityId"
          :facility-state="facilityState"
          :units-num="facilityUnits.length"
          :participant-name="participant"
          class="aside-section"
        /> -->
  </div>
</template>

<script>
import Photos from '@/components/Facility/Photos.vue'
import MiniMap from '@/components/Facility/MiniMap.vue'
export default {
  components: {
    Photos,
    MiniMap
  },
  props: {
    layout: {
      type: String,
      default: 'aside'
    },
    facilityName: {
      type: String,
      default: ''
    },
    facilityPhotos: {
      type: Array,
      default: () => []
    },
    facilityLocation: {
      type: Object,
      default: () => null
    }
  },

  computed: {
    hasLocation() {
      return this.facilityLocation ? true : false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';

.aside {
  width: 100%;
  margin-top: 1rem;

  section,
  .aside-section {
    margin-bottom: 2rem;
  }

  figcaption {
    text-align: center;
    font-size: 0.8em;
    font-weight: 700;
  }
}
.normal {
  display: flex;
  padding: 0.75rem;
  margin-bottom: 2rem;

  & > section,
  & > .aside-section {
    width: 100%;
    margin-right: 0.75rem;

    &:last-child {
      margin-right: 0;
    }
  }

  @include mobile {
    display: block;

    & > section,
    & > .aside-section {
      margin-bottom: 0.75rem;
    }
  }
}
</style>
