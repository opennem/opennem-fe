<template>
  <div :class="layout">
    <Photos 
      :has-photos="facilityPhotos.length > 0" 
      :photos="facilityPhotos" 
      :name="facilityName"
      :height="layout === 'aside' ? 'auto' : '250px'"/>
      
    <MiniMap
      :has-location="hasFacilityLocation"
      :lat="facilityLocation.lat"
      :lng="facilityLocation.lng"
      :height="layout === 'aside' ? 200 : 250"
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
    hasFacilityLocation: {
      type: Boolean,
      default: false
    },
    facilityLocation: {
      type: Object,
      default: () => ({ lat: 0, lng: 0 })
    }
  }
}
</script>

<style lang="scss" scoped>
.aside {
  width: 30%;
  margin-top: 1rem;

  section,
  .aside-section {
    margin-bottom: 1rem;
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

  & > section,
  & > .aside-section {
    width: 100%;

    &:first-child {
      margin-right: 0.75rem;
    }
  }
}
</style>
