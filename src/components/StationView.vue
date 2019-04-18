<template>
<div style="padding: 4rem;">
  <generator-detail
    :generator="stationData"
  />
</div>
</template>

<script>
import GeneratorDetail from '@/components/Generator/Detail';

export default {
  components: {
    GeneratorDetail,
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

  mounted() {
    console.log(`fetch ${this.stationId}`);
  },

};
</script>

<style lang="scss" scoped>
@import "../../node_modules/bulma/sass/utilities/mixins.sass";
</style>
