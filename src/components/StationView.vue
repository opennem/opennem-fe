<template>
<div style="padding: 4rem;">
  <facility-detail
    :generator="stationData"
  />
</div>
</template>

<script>
import FacilityDetail from '@/components/Facility/Detail';

export default {
  components: {
    FacilityDetail,
  },

  props: {
    stationId: String,
  },

  computed: {
    stationData() {
      return this.$store.getters.stationData;
    },
  },

  watch: {
    stationId(updatedId) {
      this.$store.dispatch('fetchStationData', updatedId);
    },
  },

  created() {
    this.$store.dispatch('fetchStationData', this.stationId);
  },

  mounted() {},

};
</script>

<style lang="scss" scoped>
@import "../../node_modules/bulma/sass/utilities/mixins.sass";
</style>
