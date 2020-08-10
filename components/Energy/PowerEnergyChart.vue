<template>
  <div>
    <!--
      
      :incomplete-intervals="incompleteIntervals"

      
      summary table first
      :dataset-two="chartEnergyRenewablesLine ? renewablesPercentageDataset : []"
      :dataset-two-colour="renewablesLineColour"
      :highlight-domain="highlightDomain"
      
      :mobile-screen="tabletBreak"
    -->
    <stacked-area-vis
      v-if="chartEnergy && chartEnergyType === 'area'"
      :domains="domains"
      :dataset="currentDatasetFlat"
      :range="range"
      :interval="interval"
      :curve="isEnergyType ? chartEnergyCurve : chartPowerCurve"
      :y-min="yMin"
      :y-max="yMax"
      :vis-height="350"
      :hover-on="hoverOn"
      :hover-date="hoverDate"
      :dynamic-extent="dateZoomExtent"
      :zoomed="dateZoomExtent.length > 0"
      :x-guides="xGuides"
      :x-axis-dy="tabletBreak ? 8 : 12"
      :compare-dates="compareDates"
      :focus-date="focusDate"
      :focus-on="focusOn"
      class="vis-chart"
      @dateOver="handleDateHover"
      @domainOver="handleDomainHover"
      @svgClick="handleSvgClick"
      @enter="handleVisEnter"
      @leave="handleVisLeave"
      @zoomExtent="handleZoomExtent"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { min, max } from 'd3-array'
import _cloneDeep from 'lodash.clonedeep'
import DateDisplay from '@/services/DateDisplay.js'
import StackedAreaVis from '@/components/Vis/StackedArea2.vue'

export default {
  components: {
    StackedAreaVis
  },

  data() {
    return {
      chartEnergyOptions: false
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      hoverOn: 'visInteract/isHovering',
      hoverDate: 'visInteract/hoverDate',
      hoverDomain: 'visInteract/hoverDomain',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      dateZoomExtent: 'visInteract/dateZoomExtent',
      chartEnergy: 'visInteract/chartEnergy',
      chartEnergyType: 'visInteract/chartEnergyType',
      chartEnergyYAxis: 'visInteract/chartEnergyYAxis',
      chartEnergyCurve: 'visInteract/chartEnergyCurve',
      chartPowerCurve: 'visInteract/chartPowerCurve',
      range: 'range',
      interval: 'interval',
      compareDates: 'compareDates',
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDatasetFlat: 'regionEnergy/currentDatasetFlat',
      domainTemperature: 'regionEnergy/domainTemperature',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy'
    }),
    yMin() {
      return min(this.currentDatasetFlat, d => d._stackedTotalMin)
    },
    yMax() {
      return max(this.currentDatasetFlat, d => d._stackedTotalMax)
    },
    xGuides() {
      if (this.currentDatasetFlat.length <= 0) {
        return []
      }
      let dStart = this.currentDatasetFlat[0].time
      const dEnd = this.currentDatasetFlat[this.currentDatasetFlat.length - 1]
        .time

      if (this.interval === 'Day') {
        return DateDisplay.weekendGuides(dStart, dEnd)
      }
      if (this.interval === '5m' || this.interval === '30m') {
        return DateDisplay.nightGuides(dStart, dEnd)
      }
      return []
    },
    domains() {
      return _cloneDeep(this.currentDomainPowerEnergy).reverse()
    }
  },

  methods: {
    ...mapMutations({
      setHoverDate: 'visInteract/hoverDate',
      setHoverDomain: 'visInteract/hoverDomain',
      setIsHovering: 'visInteract/isHovering',
      setDateZoomExtent: 'visInteract/dateZoomExtent'
    }),
    handleDateHover(evt, date) {
      // console.log(evt, date)
      const closestDate = DateDisplay.snapToClosestInterval(this.interval, date)
      this.setHoverDate(closestDate)
    },
    handleDomainHover(domain) {
      // console.log(domain)
      this.setHoverDomain(domain)
    },
    handleVisEnter() {
      // console.log('vis enter')
      this.setIsHovering(true)
    },
    handleVisLeave() {
      // console.log('vis leave')
      this.setIsHovering(false)
    },
    handleSvgClick(metaKey) {
      // console.log('svg click')
      this.$emit('svgClick', metaKey)
    },
    handleZoomExtent(dateRange) {
      console.log('zoom extent', dateRange)
      if (dateRange && dateRange.length > 0) {
        let startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        const endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )
        // if (this.interval === 'Fin Year') {
        //   startTime = moment(startTime).add(1, 'year')
        // }
        // this.filteredDataset = EnergyDataTransform.filterDataByStartEndDates(
        //   this.dataset,
        //   startTime,
        //   endTime
        // )
        this.setDateZoomExtent([startTime, endTime])
      } else {
        this.setDateZoomExtent([])
        // this.filteredDataset = this.dataset
      }
    }
  }
}
</script>
