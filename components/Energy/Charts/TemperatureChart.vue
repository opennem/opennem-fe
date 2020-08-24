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
      :dynamic-extent="zoomExtent"
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
      @enter="handleVisEnter"
      @leave="handleVisLeave"
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
      lineColour: '#e34a33'
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak',
      focusOn: 'visInteract/isFocusing',
      focusDate: 'visInteract/focusDate',
      xGuides: 'visInteract/xGuides',
      chartTemperature: 'visInteract/chartTemperature',
      chartPrice: 'chartOptionsPrice/chartShown',
      range: 'range',
      interval: 'interval',
      compareDates: 'compareDates',
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      currentDataset: 'regionEnergy/currentDataset',
      domainTemperature: 'regionEnergy/domainTemperature',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy'
    }),
    temperatureDomains() {
      return this.domainTemperature
    },
    temperatureDataset() {
      return this.currentDataset
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
      return min(this.currentDataset, d => d._stackedTotalMin)
    },
    yMax() {
      return max(this.currentDataset, d => d._stackedTotalMax)
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
    }
  }
}
</script>
