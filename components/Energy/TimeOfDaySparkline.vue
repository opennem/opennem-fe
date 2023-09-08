<template>
  <div 
    style="width: 100%" 
    class="vis-wrapper sparkline-button">

    <TimeOfDayChartHeader 
      class="header" 
      :title="title" />

    <div 
      v-if="title === 'Price'" 
      class="sparkline">
      <MultiLine
        :svg-height="chartHeightPositiveLogPrice"
        :domains1="domainsWithColour"
        :dataset1="dataset"
        :y1-max="20000"
        :y1-min="300"
        :y1-ticks="[300, 2000, 6000, 10000, 14000]"
        :y1-log="true"
        :y1-tick-line="false"
        :y1-tick-text="false"
        :x-ticks="xTicks"
        :x-tick-line="false"
        :curve="curve"
        :date-hovered="hoverDate"
        :highlight-domain="highlightDomain"
        :positive-y-bg="'transparent'"
        :cursor-type="'line'"
        :append-datapoint="false"
        :stroke-dasharray="'2,2'"
        class="vis-chart"
        @date-hover="(evt, date) => handleDateHover(date)" 
        @domain-hover="handleDomainHover"
        @enter="handleVisEnter"
        @leave="handleVisLeave"
      />
      <MultiLine
        style="position: relative; top: -1px"
        :svg-height="chartHeightPrice"
        :domains1="domainsWithColour"
        :dataset1="dataset"
        :y1-max="300"
        :y1-min="0"
        :y1-ticks="[0, 100, 200, 300]"
        :y1-tick-line="false"
        :y1-tick-text="false"
        :x-ticks="xTicks"
        :x-tick-line="false"
        :curve="curve"
        :date-hovered="hoverDate"
        :highlight-domain="highlightDomain"
        :positive-y-bg="'transparent'"
        :cursor-type="'line'"
        :append-datapoint="false"
        class="vis-chart"
        @date-hover="(evt, date) => handleDateHover(date)" 
        @domain-hover="handleDomainHover"
        @enter="handleVisEnter"
        @leave="handleVisLeave"
      />
      <MultiLine
        style="position: relative; top: -1px"
        :svg-height="chartHeightNegativeLogPrice"
        :domains1="domainsWithColour"
        :dataset1="dataset"
        :y1-max="-1100"
        :y1-min="-0.1"
        :y1-invert="true"
        :y1-ticks="[-60, -400]"
        :y1-log="true"
        :y1-tick-line="false"
        :y1-tick-text="false"
        :x-ticks="xTicks"
        :x-tick-line="false"
        :curve="curve"
        :date-hovered="hoverDate"
        :highlight-domain="highlightDomain"
        :positive-y-bg="'transparent'"
        :cursor-type="'line'"
        :append-datapoint="false"
        :stroke-dasharray="'2,2'"
        class="vis-chart"
        @date-hover="(evt, date) => handleDateHover(date)" 
        @domain-hover="handleDomainHover"
        @enter="handleVisEnter"
        @leave="handleVisLeave"
      />
    </div>

    <div 
      v-else 
      class="sparkline">
      <MultiLine
        :svg-height="chartHeight"
        :domains1="domainsWithColour"
        :dataset1="dataset"
        :y1-max="yMax"
        :y1-min="yMin"
        :y1-ticks="yTicks"
        :y1-tick-line="false"
        :y1-tick-text="false"
        :x-ticks="null"
        :x-tick-line="false"
        :curve="curve"
        :date-hovered="hoverDate"
        :highlight-domain="highlightDomain"
        :positive-y-bg="'transparent'"
        :cursor-type="'line'"
        :append-datapoint="false"
        class="vis-chart"
        @date-hover="(evt, date) => handleDateHover(date)" 
        @domain-hover="handleDomainHover"
        @enter="handleVisEnter"
        @leave="handleVisLeave"
      />
    </div>

    <footer>
      <div 
        v-if="tooltipValues" 
        class="tooltip-container">
        <span>{{ tooltipValues.date }} </span>
        <span style="font-weight: bold;">{{ tooltipValues.value | formatValue }}</span>
      </div>
      <div v-else-if="hoverValues">
        <span>{{ hoverValues.x }} </span>
      </div>
      <div 
        v-else 
        style="height: 16.5px;"/>
    </footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { utcHour } from 'd3-time'
import _cloneDeep from 'lodash.clonedeep'
import DateDisplay from '@/services/DateDisplay.js'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'
import TimeOfDayChartHeader from './TimeOfDayChartHeader.vue'

export default {
  components: {
    MultiLine,
    DateBrush,
    TimeOfDayChartHeader
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    yTicks: {
      type: Array,
      default: () => []
    },
    tickFormat: {
      type: Function,
      default: () => {}
    },
    secondTickFormat: {
      type: Function,
      default: () => {}
    },
    curve: {
      type: String,
      default: ''
    },
    yMin: {
      type: Number,
      default: 0
    },
    yMax: {
      type: Number,
      default: 0
    },
    todayKey: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      expand: false,
      xTicks: utcHour.every(2),
      highlightDomain: null,
      highlightRow: null,
      hoverDate: null
    }
  },

  computed: {
    ...mapGetters({
      interval: 'interval'
    }),
    tooltipValues() {
      if (this.highlightRow && this.hoverValues) {
        const domainLabel = this.highlightRow === '_average' ? 'Av' : this.highlightRow
        return {
          date: `${domainLabel}, ${this.hoverValues.x}`,
          value: this.hoverValues[this.highlightRow]
        }
      }

      return null
    },

    chartHeight() {
      return this.expand ? 400 : 45
    },

    chartHeightPrice() {
      return this.expand ? 160 : 20
    },
    chartHeightPositiveLogPrice() {
      return this.expand ? 130 : 15
    },
    chartHeightNegativeLogPrice() {
      return this.expand ? 110 : 10
    },

    domainsWithColour() {
      return this.domains.map((domain) => {
        return {
          ...domain,
          colour: this.getChartColour(domain.id),
          value: this.hoverValues ? this.hoverValues[domain.id] : null,
          pathStrokeWidth: this.getPathStrokeWidth(domain.id)
        }
      })
    },
    
    tableRowDomains() {
      return this.expand ? this.allRowsDomains : this.collapsedDomains
    },

    allRowsDomains() {
      return this.domainsWithColour.map((domain) => {
        return {
          id: domain.id,
          label: domain.label,
          value: this.hoverValues ? this.hoverValues[domain.id] : null
        }
      }) 
    },

    collapsedDomains() {
      const domains = this.domainsWithColour.filter(d => d.id === '_average' || d.id === this.todayKey)

      return domains.map((domain) => {
        return {
          id: domain.id,
          label: domain.label,
          value: this.hoverValues ? this.hoverValues[domain.id] : null
        }
      })  
    },

    hoverValues() {
      return this.hoverDate ? this.dataset.find(d => d.time === this.hoverDate.getTime()) : null
    },

    currentX() {
      return this.hoverValues ? this.hoverValues.x : null
    }
  },

  watch: {
    yMax(val) {
      // console.log(val)
    }
  },

  methods: {
    handleDomainHover(domain) {
      this.highlightRow = domain
      this.highlightDomain = domain
    },

    handleDateHover(date) {
      this.hoverDate = DateDisplay.getClosestDateByInterval(
        date,
        this.interval,
        null
      )
    },
    
    handleVisEnter() {
      // this.$emit('isHovering', true)
    },

    handleVisLeave() {
      // this.$emit('isHovering', false)
    },

    getChartColour(id) {
      if (id === '_average') return '#DC3A33'
      return this.todayKey === id ? '#333' : this.expand ? '#aaa' : '#ccc';
    },

    getTextColour(id) {
      if (id === '_average') return '#DC3A33'
      return this.todayKey === id ? '#333' : this.expand ? '#787878' : '#ddd';
    },

    getPathStrokeWidth(id) {
      if (id === '_average') return 2
      return this.todayKey === id ? 2 : 1;
    },

    handleTableToggle() {
      this.expand = !this.expand
    },

    handleMouseEnter(id) {
      this.highlightDomain = id
    },

    handleMouseLeave() {
      this.highlightDomain = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
$border-radius: 0.4rem;

.sparkline-button {
  cursor: pointer;
  // border: 1px solid #ccc;
  border-radius: $border-radius;
  background-color: rgba(255,255,255, 0.3);

  &:hover {
    background-color: rgba(255,255,255, 0.8);
  }
}

header {
  padding-left: 0.3rem;
}

.sparkline {
  padding-right: 5px;
  padding-top: 3px;
}

footer {
  padding: 3px 0.3rem 0;
  font-size: 11px;

  .tooltip-container {
    display: flex;
    justify-content: space-between;
  }
}

</style>
