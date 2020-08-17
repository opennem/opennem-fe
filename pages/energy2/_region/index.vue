<template>
  <div class="energy-region">
    <data-options-bar />
    <div class="vis-summary vis-table-container">
      <vis-section class="vis-section vis-container" />
      <summary-section class="summary-section table-container"/>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import _debounce from 'lodash.debounce'
import { isPowerRange } from '@/constants/rangeInterval.js'
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
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName',
      fuelTechGroup: 'fuelTechGroup'
    }),
    regionId() {
      return this.$route.params.region
    }
  },

  watch: {
    range(curr, prev) {
      if (isPowerRange(curr) && isPowerRange(prev)) {
        this.doFilterRegionData({
          range: curr,
          interval: this.interval
        })
      } else {
        this.doGetRegionData({
          region: this.regionId,
          range: curr,
          interval: this.interval,
          groupName: this.fuelTechGroupName
        })
      }
    },
    interval(interval) {
      this.doUpdateDatasetByInterval({ range: this.range, interval })
    },
    filterPeriod(period) {
      this.doUpdateDatasetByFilterPeriod({
        range: this.range,
        interval: this.interval,
        period
      })
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

  mounted() {
    this.setWindowWidth(window.innerWidth)
    this.$nextTick(() => {
      window.addEventListener(
        'resize',
        _debounce(() => {
          this.setWindowWidth(window.innerWidth)
        }, 200)
      )
    })
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'regionEnergy/doGetRegionData',
      doUpdateDatasetByInterval: 'regionEnergy/doUpdateDatasetByInterval',
      doUpdateDatasetByGroup: 'regionEnergy/doUpdateDatasetByGroup',
      doFilterRegionData: 'regionEnergy/doFilterRegionData',
      doUpdateDatasetByFilterPeriod:
        'regionEnergy/doUpdateDatasetByFilterPeriod'
    }),
    ...mapMutations({
      setWindowWidth: 'app/windowWidth'
    })
  }
}
</script>

<style lang="scss" scoped>
</style>
