<template>
  <div>
    <div 
      :class="{
      'is-hovered': hoverOn }" 
      class="chart">
      <power-chart-options
        :options="options"
        :chart-shown="chartShown"
        :chart-type="chartType"
        :chart-curve="chartCurve"
        :display-unit="displayUnit"
        :hover-display-date="hoverDisplayDate"
        :hover-value="hoverValue"
        :hover-domain-label="hoverDomainLabel"
        :hover-domain-colour="hoverDomainColour"
        :hover-total="hoverTotal"
        :show-total="domains.length > 1"
      />
      <stacked-area-vis
        v-if="chartShown"
        :domains="domains"
        :dataset="dataset"
        :y-min="yMin"
        :y-max="computedYMax"
        :y-axis-ticks="5"
        :vis-height="200"
        :curve="chartCurve"
        :dynamic-extent="zoomExtent"
        :zoomed="zoomExtent.length > 0"
        :show-tooltip="false"
        :highlight-domain="highlightId"
        :hover-on="hoverOn"
        :hover-date="hoverDate"
        class="vis-chart"
        @dateOver="handleDateHover"
        @domainOver="handleDomainHover"
        @enter="handleVisEnter"
        @leave="handleVisLeave"
        @zoomExtent="handleZoomExtent"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import parseISO from 'date-fns/parseISO'
import getTime from 'date-fns/getTime'
import DateDisplay from '@/services/DateDisplay.js'
import * as OPTIONS from '@/constants/chart-options.js'
import StackedAreaVis from '@/components/Vis/StackedArea.vue'
import PowerChartOptions from '@/components/Facility/Charts/PowerChartOptions'

const options = {
  type: [OPTIONS.CHART_HIDDEN, OPTIONS.CHART_STACKED],
  curve: [
    OPTIONS.CHART_CURVE_SMOOTH,
    OPTIONS.CHART_CURVE_STEP,
    OPTIONS.CHART_CURVE_STRAIGHT
  ],
  yAxis: []
}

export default {
  components: {
    PowerChartOptions,
    StackedAreaVis
  },

  props: {
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    zoomExtent: {
      type: Array,
      default: () => []
    },
    hoverOn: {
      type: Boolean,
      default: false
    },
    hoverDate: {
      type: Date,
      default: null
    },
    displayUnit: {
      type: String,
      default: ''
    },
    facilityId: {
      type: String,
      default: ''
    },
    yMax: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      options,
      hoverDomain: ''
    }
  },

  computed: {
    ...mapGetters({
      chartShown: 'chartOptionsFacilityPower/chartShown',
      chartType: 'chartOptionsFacilityPower/chartType',
      chartCurve: 'chartOptionsFacilityPower/chartCurve',
      highlightDomain: 'visInteract/highlightDomain'
    }),

    highlightId() {
      const domain = this.highlightDomain
      const find = this.domains.find(d => d.code === domain)
      return find ? find.code : ''
    },
    yMin() {
      let lowest = 0
      this.dataset.forEach(d => {
        let total = 0
        this.domains.forEach(domain => {
          total += d[domain.id] || 0
        })

        if (total < lowest) {
          lowest = total
        }
      })

      return lowest
    },
    computedYMax() {
      let highest = 0

      this.dataset.forEach(d => {
        let total = 0
        this.domains.forEach(domain => {
          total += d[domain.id] || 0
        })

        if (total > highest) {
          highest = total
        }
      })

      return highest > this.yMax ? highest : this.yMax
    },
    hoverData() {
      if (!this.hoverDate) {
        return null
      }
      const time = this.hoverDate.getTime()
      return this.dataset.find(d => d.time === time)
    },
    hoverValue() {
      return this.hoverData ? this.hoverData[this.hoverDomain] : null
    },
    hoverDisplayDate() {
      if (!this.hoverDate) {
        return ''
      }
      return DateDisplay.defaultDisplayDate(this.hoverDate.getTime())
    },
    hoverTotal() {
      let total = 0
      if (this.hoverData) {
        this.domains.forEach(d => {
          total += this.hoverData[d.code] || 0
        })
      }
      return total
    },
    hoverDomainLabel() {
      const find = this.domains.find(d => d.code === this.hoverDomain)
      return find ? find.code : '—'
    },
    hoverDomainColour() {
      const find = this.domains.find(d => d.code === this.hoverDomain)
      return find ? find.colour : '—'
    }
  },

  updated() {
    // console.log(this.dataset)
  },

  methods: {
    handleDomainHover(domain) {
      this.hoverDomain = domain
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
    handleZoomExtent(dateRange) {
      this.$emit('zoomExtent', dateRange)
    }
  }
}
</script>
