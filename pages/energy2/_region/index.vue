<template>
  <div class="energy-region">
    <data-options-bar />
    <div class="vis-summary vis-table-container">
      <vis-section 
        class="vis-section vis-container" 
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering" />
      <summary-section
        :hover-date="hoverDate"
        :is-hovering="isHovering"
        class="summary-section table-container"/>
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

  data() {
    return {
      isHovering: false,
      hoverDate: null
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName',
      fuelTechGroup: 'fuelTechGroup',
      currentDatasetFlat: 'regionEnergy/currentDatasetFlat'
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
      this.doUpdateTickFormats({ range: curr, interval: this.interval })
    },
    interval(interval) {
      this.doUpdateDatasetByInterval({ range: this.range, interval })
      this.doUpdateTickFormats({ range: this.range, interval: interval })
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
    },
    currentDatasetFlat(dataset) {
      if (dataset.length > 0) {
        this.doUpdateXGuides({
          interval: this.interval,
          start: dataset[0].time,
          end: dataset[dataset.length - 1].time
        })
      }
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
        'regionEnergy/doUpdateDatasetByFilterPeriod',
      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats'
    }),
    ...mapMutations({
      setWindowWidth: 'app/windowWidth'
    }),
    handleDateHover(date) {
      this.hoverDate = date
    },
    handleIsHovering(hover) {
      this.isHovering = hover
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
