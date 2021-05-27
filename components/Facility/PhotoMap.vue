<template>
  <div :class="layout">
    <div 
      v-highlight="showFields"
      @click.stop.self="() => handleFieldClick('Facility photos', facilityPhotos)">
      <Photos
        v-if="facilityPhotos.length > 0"
        :has-photos="facilityPhotos.length > 0"
        :photos="facilityPhotos"
        :name="facilityName"
        :height="layout === 'aside' ? '250px' : '200px'"/>
    </div>
    

    <div 
      v-highlight="showFields"
      @click.stop.self="() => handleFieldClick('Facility default map', facilityLocation.geom)">
      <MiniMap
        :has-location="hasLocation"
        :boundary="facilityLocation.boundary"
        :point="facilityLocation.geom"
        :fit-bounds="false"
        class="map" />
    </div>

    <div 
      v-highlight="showFields"
      @click.stop.self="() => handleFieldClick('Facility satellite map', facilityLocation.geom)">
      <MiniMap
        :has-location="hasLocation"
        :zoom="13"
        :boundary="facilityLocation.boundary"
        :point="facilityLocation.geom"
        :map-style="'mapbox://styles/mapbox/satellite-streets-v11'"
        :show-marker="false"
        :is-dark="true"
        class="map" />
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
      showFields: 'facility/showFields'
    }),
    hasLocation() {
      return this.facilityLocation &&
        (this.facilityLocation.geom || this.facilityLocation.boundary)
        ? true
        : false
    }
  },

  methods: {
    ...mapActions({
      addField: 'facility/addField'
    }),
    handleFieldClick(key, value) {
      this.addField({ key, value })
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
