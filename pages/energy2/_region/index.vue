<template>
  <div class="energy-region">
    <data-options-bar />
    <div class="vis-summary">
      <vis-section class="vis-section" />
      <summary-section class="summary-section"/>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DataOptionsBar from '@/components/Energy/DataOptionsBar.vue'
import VisSection from '@/components/Energy/VisSection.vue'
import SummarySection from '@/components/Energy/SummarySection.vue'

export default {
  layout: 'main',
  components: {
    DataOptionsBar,
    VisSection,
    SummarySection
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      fuelTechGroupName: 'fuelTechGroupName',
      fuelTechGroup: 'fuelTechGroup'
    }),
    regionId() {
      return this.$route.params.region
    }
  },

  watch: {
    range(updated) {
      this.doGetRegionData({
        region: this.regionId,
        range: updated,
        interval: this.interval,
        groupName: this.fuelTechGroupName
      })
    },
    interval(interval) {
      this.doUpdateDatasetByInterval({ interval })
    },
    fuelTechGroupName(groupName) {
      this.doUpdateDatasetByGroup({ groupName })
    }
  },
  created() {
    this.doGetRegionData({
      region: this.regionId,
      range: this.range,
      interval: this.interval,
      groupName: this.fuelTechGroupName
    })
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'regionEnergy/doGetRegionData',
      doUpdateDatasetByInterval: 'regionEnergy/doUpdateDatasetByInterval',
      doUpdateDatasetByGroup: 'regionEnergy/doUpdateDatasetByGroup'
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
