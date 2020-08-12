<template>
  <div 
    :class="{
      'is-hovered': hoverOn || focusOn,
      'has-border-bottom': !chartTemperature,
      'adjustment': chartPrice
    }"
    class="temperature-chart chart">
    <line-vis
      v-if="chartTemperature"
      :domain-id="temperatureMeanDomain"
      :min-domain-id="temperatureMinDomain"
      :max-domain-id="temperatureMaxDomain"
      :domain-colour="lineColour"
      :dataset="temperatureDataset"
      :dynamic-extent="dateZoomExtent"
      :hover-date="hoverDate"
      :hover-on="hoverOn"
      :focus-date="focusDate"
      :focus-on="focusOn"
      :range="range"
      :interval="interval"
      :curve="'smooth'"
      :y-axis-log="false"
      :y-min="0"
      :show-x-axis="false"
      :show-tooltip="false"
      :show-point-on-hover="true"
      :vis-height="100"
      :show-zoom-out="false"
      :x-guides="xGuides"
      class="temperature-vis vis-chart"
      @dateOver="handleDateHover"
      @svgClick="handleSvgClick"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { min, max } from 'd3-array'
import _cloneDeep from 'lodash.clonedeep'
import DateDisplay from '@/services/DateDisplay.js'
import ChartHeader from '@/components/Vis/ChartHeader'
import LineVis from '@/components/Vis/Line.vue'
import {
  TEMPERATURE,
  TEMPERATURE_MIN,
  TEMPERATURE_MEAN,
  TEMPERATURE_MAX
} from '@/constants/v2/data-types.js'

export default {
  components: {
    ChartHeader,
    LineVis
  },

  data() {
    return {
      chartEnergyOptions: false,
      lineColour: '#e34a33'
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
      chartTemperature: 'visInteract/chartTemperature',
      chartPrice: 'visInteract/chartPrice',
      range: 'range',
      interval: 'interval',
      compareDates: 'compareDates',
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDatasetFlat: 'regionEnergy/currentDatasetFlat',
      domainTemperature: 'regionEnergy/domainTemperature',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      filteredSummary: 'regionEnergy/filteredSummary'
    }),
    temperatureDomains() {
      return this.domainTemperature
    },
    temperatureDataset() {
      return this.currentDatasetFlat
    },
    temperatureMeanDomain() {
      const find = this.temperatureDomains.find(
        t => t.type === TEMPERATURE || t.type === TEMPERATURE_MEAN
      )
      return find ? find.domain : ''
    },
    temperatureMinDomain() {
      const find = this.temperatureDomains.find(t => t.type === TEMPERATURE_MIN)
      return find ? find.domain : ''
    },
    temperatureMaxDomain() {
      const find = this.temperatureDomains.find(t => t.type === TEMPERATURE_MAX)
      return find ? find.domain : ''
    },
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
    },
    isYearInterval() {
      return this.interval === 'Fin Year' || this.interval === 'Year'
    },
    isRenewableLineOnly() {
      return this.chartEnergyRenewablesLine && this.domains.length === 0
    },
    averageEnergy() {
      return this.filteredSummary ? this.filteredSummary._averageEnergy : 0
    },
    hoverData() {
      if (!this.hoverDate) {
        return null
      }
      const time = this.hoverDate.getTime()
      // let dataset = this.currentDatasetFlat
      // if (this.chartEnergyType === 'proportion') {
      //   dataset = this.energyPercentDataset
      // }
      // if (
      //   this.chartEnergyType === 'line' &&
      //   this.chartEnergyYAxis === 'percentage'
      // ) {
      //   dataset = this.energyGrossPercentDataset
      // }
      return this.currentDatasetFlat.find(d => d.time === time)
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
      // console.log('zoom extent', dateRange)
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
