<template>
  <div class="vis-summary">
    <section class="vis-section">
      <data-options-bar />
      <header/>
    </section>
    
    <section class="summary-section"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DataOptionsBar from '~/components/Energy/DataOptionsBar'

export default {
  layout: 'main',
  components: {
    DataOptionsBar
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      energyRegions: 'region-energy/energyRegions',
      energyFuelTechs: 'region-energy/energyFuelTechs'
    }),
    regionId() {
      return this.$route.params.region
    }
  },

  watch: {
    range(updated) {
      this.doGetRegionData({ region: this.regionId, range: updated })
    }
  },
  created() {
    this.doGetRegionData({ region: this.regionId, range: this.range })
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'region-energy/doGetRegionData'
    })
  }
}
</script>

<style lang="scss" scoped>
.vis-summary {
  display: flex;
  .vis-section {
    width: 75%;
  }
  .summary-section {
    width: 25%;
  }
}
</style>
