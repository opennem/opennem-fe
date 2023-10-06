<template>
  <div 
    style="width: 100%" 
    class="vis-wrapper sparkline-button"
    :class=" { selected: selected }"
  >
    <h6 style="font-size: 11px; padding: 3px 6px 0;">{{ title }}</h6>
    
    <div 
      v-if="title === 'Price'" 
      class="sparkline">
      <MultiLine
        :svg-height="chartHeightPositiveLogPrice"
        :domains1="chartDomains"
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
        :positive-y-bg="'transparent'"
        :cursor-type="'line'"
        :append-datapoint="false"
        :stroke-dasharray="'2,2'"
        class="vis-chart"
      />
      <MultiLine
        style="position: relative; top: -1px"
        :svg-height="chartHeightPrice"
        :domains1="chartDomains"
        :dataset1="dataset"
        :y1-max="300"
        :y1-min="0"
        :y1-ticks="[0, 100, 200, 300]"
        :y1-tick-line="false"
        :y1-tick-text="false"
        :x-ticks="xTicks"
        :x-tick-line="false"
        :curve="curve"
        :positive-y-bg="'transparent'"
        :cursor-type="'line'"
        :append-datapoint="false"
        class="vis-chart"
      />
      <MultiLine
        style="position: relative; top: -1px"
        :svg-height="chartHeightNegativeLogPrice"
        :domains1="chartDomains"
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
        :positive-y-bg="'transparent'"
        :cursor-type="'line'"
        :append-datapoint="false"
        :stroke-dasharray="'2,2'"
        class="vis-chart"
      />
    </div>

    <div 
      v-else 
      class="sparkline">
      <MultiLine
        :svg-height="chartHeight"
        :domains1="chartDomains"
        :dataset1="dataset"
        :y1-max="yMax"
        :y1-min="yMin"
        :y1-ticks="yTicks"
        :y1-tick-line="false"
        :y1-tick-text="false"
        :x-ticks="null"
        :x-tick-line="false"
        :curve="curve"
        :positive-y-bg="'transparent'"
        :cursor-type="'line'"
        :append-datapoint="false"
        class="vis-chart"
      />
    </div>
  </div>
</template>

<script>
import _cloneDeep from 'lodash.clonedeep'
import MultiLine from '@/components/Vis/MultiLine'
import DateBrush from '@/components/Vis/DateBrush'

export default {
  components: {
    MultiLine,
    DateBrush
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
    xTicks: {
      type: Function,
      default: () => null
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
    },
    selected: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      chartHeight: 25,
      chartHeightPrice: 10,
      chartHeightPositiveLogPrice: 8,
      chartHeightNegativeLogPrice: 6
    }
  },

  computed: {
    chartDomains() {
      return this.domains.map((domain) => {
        return {
          ...domain,
          colour: this.getChartColour(domain.id),
          pathStrokeWidth: 1
        }
      })
    }
  },

  methods: {
    getChartColour(id) {
      if (id === '_average') return this.selected ? '#ccc' : '#DC3A33'
      return this.todayKey === id ? '#333' : '#ccc';
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
$border-radius: 0.4rem;

.sparkline-button {
  cursor: pointer;
  border-radius: $border-radius;
  background-color: rgba(200,200,200, 0.3);
  transition: all 0.2s ease-in-out;

  .selected {
    background-color: #c74523;
    color: #fff;

    &:hover {
      background-color: #c74523;
    }
  }

  &:hover {
    background-color: #fefefe;
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(0,0,0,0.05);
  }
}

.sparkline {
  padding-right: 5px;
  padding-top: 3px;
  padding-bottom: 5px;
}
</style>
