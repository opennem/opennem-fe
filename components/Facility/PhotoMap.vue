<template>
  <div 
    :class="layout" 
    class="photo-map">
    <div
      v-highlight="showFields"
      v-if="facilityPhotos.length > 0"
      @click.stop.self="
        () => handleFieldClick('Facility photos', facilityPhotos)
      "
    >
      <Photos
        :has-photos="facilityPhotos.length > 0"
        :photos="facilityPhotos"
        :name="facilityName"
        :height="layout === 'aside' ? '250px' : '200px'"
      />
    </div>

    <div
      v-highlight="showFields"
      @click.stop.self="
        () => handleFieldClick('Facility default map', facilityLocation.geom)
      "
    >
      <!-- :boundary="facilityLocation.boundary" -->
      <MiniMap
        :has-location="hasLocation"
        :point="point"
        :fit-bounds="false"
        class="map"
      />
    </div>

    <div
      v-highlight="showFields"
      @click.stop.self="
        () => handleFieldClick('Facility satellite map', facilityLocation.geom)
      "
    >
      <!-- :boundary="facilityLocation.boundary" -->

      <MiniMap
        :has-location="hasLocation"
        :zoom="13"
        :point="point"
        :map-style="'mapbox://styles/mapbox/satellite-streets-v11'"
        :show-marker="false"
        :is-dark="true"
        class="map"
      />
    </div>

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
import { mapGetters, mapActions } from 'vuex'
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
    ...mapGetters({
      showFields: 'feedback/showFields'
    }),
    hasLocation() {
      return this.facilityLocation 
        ? true
        : false
    },
    point() {
      if (this.hasLocation) 
      return this.hasLocation
        ? [this.facilityLocation.lng, this.facilityLocation.lat]
        : null
    }
  },

  methods: {
    ...mapActions({
      addField: 'feedback/addField'
    }),
    handleFieldClick(key, value) {
      this.addField({ key, value })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';

.photo-map {
  & > div {
    margin-bottom: 2rem;
  }
}

.aside {
  width: 100%;
  margin-top: 4rem;

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
  gap: 10px;

  & > section,
  & > .aside-section {
    width: 100%;
    margin-right: 0.75rem;

    &:last-child {
      margin-right: 0;
    }
  }

  & > div {
    width: 100%;
  }

  @include mobile {
    display: block;

    & > section,
    & > .aside-section {
      margin-bottom: 0.75rem;
    }

    & > div {
      margin-bottom: 0.75rem;
    }
  }
}
</style>
