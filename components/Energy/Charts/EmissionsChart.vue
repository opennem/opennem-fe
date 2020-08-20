<template>
  <div 
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartEmissionsVolume
    }"
    class="chart">
    <stacked-area-vis
      v-if="chartEmissionsVolume"
      :domains="domains"
      :dataset="currentDataset"
      :range="range"
      :interval="interval"
      :curve="'step'"
      :y-min="yMin"
      :y-max="yMax"
      :vis-height="200"
      :show-x-axis="false"
      :show-tooltip="false"
      :show-zoom-out="false"
      :hover-on="hoverOn"
      :hover-date="hoverDate"
      :dynamic-extent="zoomExtent"
      :zoomed="zoomExtent.length > 0"
      :x-guides="xGuides"
      :x-axis-dy="tabletBreak ? 8 : 12"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :incomplete-intervals="incompleteIntervals"
      :highlight-domain="highlightId"
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
import _includes from 'lodash.includes'
import _cloneDeep from 'lodash.clonedeep'
import addWeeks from 'date-fns/addWeeks'
import addMonths from 'date-fns/addMonths'
import addQuarters from 'date-fns/addQuarters'
import addYears from 'date-fns/addYears'
import DateDisplay from '@/services/DateDisplay.js'
import ChartHeader from '@/components/Vis/ChartHeader'
import StackedAreaVis from '@/components/Vis/StackedArea2.vue'

export default {
  components: {
    ChartHeader,
    StackedAreaVis
  },

  props: {
    hoverOn: {
      type: Boolean,
      default: false
    },
    hoverDate: {
      type: Date,
      default: null
    },
    zoomExtent: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      chartEnergyOptions: false,
      yMin: 0
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      hoverDomain: 'visInteract/hoverDomain',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      xGuides: 'visInteract/xGuides',

      chartEmissionsVolume: 'visInteract/chartEmissionsVolume',
      highlightDomain: 'visInteract/highlightDomain',
      range: 'range',
      interval: 'interval',
      fuelTechGroupName: 'fuelTechGroupName',
      hiddenFuelTechs: 'hiddenFuelTechs',
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDataset: 'regionEnergy/currentDataset',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions'
    }),
    highlightId() {
      const domain = this.highlightDomain
      const property =
        this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
      const find = this.domains.find(d => d[property] === domain)
      return find ? find.id : ''
    },
    yMax() {
      const dataset = _cloneDeep(this.currentDataset)
      dataset.forEach(d => {
        let stackedMax = 0
        this.domains.forEach(domain => {
          stackedMax += d[domain.id]
        })
        d._stackedTotalEmissionsMax = stackedMax
      })
      return max(dataset, d => d._stackedTotalEmissionsMax)
    },

    domains() {
      const property =
        this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'group'
      const domains = this.emissionsDomains
      const hidden = this.hiddenFuelTechs
      return domains.filter(d => !_includes(hidden, d[property]))
    },
    emissionsDomains() {
      return _cloneDeep(this.currentDomainEmissions).reverse()
    },
    isYearInterval() {
      return this.interval === 'Fin Year' || this.interval === 'Year'
    },
    hoverData() {
      if (!this.hoverDate) {
        return null
      }
      const time = this.hoverDate.getTime()
      // let dataset = this.currentDataset
      // if (this.chartEnergyType === 'proportion') {
      //   dataset = this.energyPercentDataset
      // }
      // if (
      //   this.chartEnergyType === 'line' &&
      //   this.chartEnergyYAxis === 'percentage'
      // ) {
      //   dataset = this.energyGrossPercentDataset
      // }
      return this.currentDataset.find(d => d.time === time)
    },
    hoverValue() {
      return this.hoverData ? this.hoverData[this.hoverDomain] : null
    },
    hoverDisplayDate() {
      let date = this.focusDate
      if (this.hoverOn) {
        date = this.hoverDate
      }
      return date
        ? DateDisplay.specialDateFormats(
            date.getTime(),
            this.range,
            this.interval,
            false,
            false,
            false,
            true
          )
        : ''
    },
    hoverDomainLabel() {
      let find = null
      // if (
      //   this.chartEnergyType === 'proportion' ||
      //   (this.chartEnergyType === 'line' &&
      //     this.chartEnergyYAxis === 'percentage')
      // ) {
      //   find = this.stackedEnergyPercentDomains.find(
      //     d => d.id === this.hoverDomain
      //   )
      // } else {
      //   find = this.currentDomainPowerEnergy.find(d => d.id === this.hoverDomain)
      // }

      find = this.currentDomainPowerEnergy.find(d => d.id === this.hoverDomain)
      return find ? find.label : '—'
    },
    hoverDomainColour() {
      let find = null
      // if (
      //   this.chartEnergyType === 'proportion' ||
      //   (this.chartEnergyType === 'line' &&
      //     this.chartEnergyYAxis === 'percentage')
      // ) {
      //   find = this.stackedEnergyPercentDomains.find(
      //     d => d.id === this.hoverDomain
      //   )
      // } else {
      //   find = this.currentDomainPowerEnergy.find(d => d.id === this.hoverDomain)
      // }

      find = this.currentDomainPowerEnergy.find(d => d.id === this.hoverDomain)
      return find ? find.colour : '—'
    },
    hoverTotal() {
      let total = 0
      if (this.hoverData) {
        this.currentDomainPowerEnergy.forEach(d => {
          total += this.hoverData[d.id]
        })
      }
      return total
    },
    incompleteIntervals() {
      const incompletes = []
      const filtered = this.currentDataset.filter(d => d._isIncompleteBucket)
      filtered.forEach(f => {
        if (this.interval === 'Week') {
          incompletes.push({
            start: f.date,
            end: addWeeks(f.date, 1)
          })
        }
        if (this.range === '1Y' && this.interval === 'Month') {
          incompletes.push({
            start: f.date,
            end: addMonths(f.date, 1)
          })
        }
        if (this.interval === 'Season') {
          incompletes.push({
            start: f.date,
            end: addMonths(f.date, 3)
          })
        }
        if (this.interval === 'Quarter') {
          incompletes.push({
            start: f.date,
            end: addQuarters(f.date, 1)
          })
        }
        if (this.interval === 'Half Year') {
          incompletes.push({
            start: f.date,
            end: addMonths(f.date, 6)
          })
        }
        if (this.interval === 'Year' || this.interval === 'Fin Year') {
          incompletes.push({
            start: f.date,
            end: addYears(f.date, 1)
          })
        }
      })
      return incompletes
    }
  },

  methods: {
    ...mapMutations({
      setHoverDomain: 'visInteract/hoverDomain'
    }),
    handleDomainHover(domain) {
      this.setHoverDomain(domain)
    },
    handleDateHover(evt, date) {
      this.$emit('dateHover', date)
    },
    handleVisEnter() {
      this.$emit('isHovering', true)
    },
    handleVisLeave() {
      this.$emit('isHovering', false)
    },
    handleSvgClick(metaKey) {
      this.$emit('svgClick', metaKey)
    },
    handleZoomExtent(dateRange) {
      this.$emit('zoomExtent', dateRange)
    }
  }
}
</script>
