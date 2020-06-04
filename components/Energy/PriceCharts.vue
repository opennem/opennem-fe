<template>
  <chart-wrapper 
    :show-chart="chartPrice"
    :hover-values="hoverValues"
    :formatter="$options.filters.formatCurrency"
    state-name="chartPrice">
    <template v-slot:header>
      <strong>Price</strong>
    </template>
    <template v-slot:datetime>
      {{ hoverDate }}
    </template>

    <multi-line
      v-show="chartPrice"
      :svg-height="75"
      :margin-bottom="0"
      :line-domains="chartOptions.domains"
      :dataset="priceDataset"
      :y-max="20000"
      :y-min="300"
      :date-hovered="chartOptions.dateHovered"
      :zoom-range="chartOptions.zoomRange"
      :x-ticks="chartOptions.xTicks"
      :x-shades="chartOptions.xShades"
      :y-tick-text="true"
      :y-log="true"
      :y-ticks="[300, 2000, 6000, 10000, 14000]"
      :curve="'smooth'"
      class="dash-stroke-lines"
      style="height: 75px;"
      @date-hover="handleDateHover"
      @enter="handleEnter"
      @leave="handleLeave" />
    <multi-line
      v-show="chartPrice"
      :svg-height="150"
      :margin-bottom="0"
      :line-domains="chartOptions.domains"
      :dataset="priceDataset"
      :y-max="300"
      :y-min="0"
      :date-hovered="chartOptions.dateHovered"
      :zoom-range="chartOptions.zoomRange"
      :x-ticks="chartOptions.xTicks"
      :x-shades="chartOptions.xShades"
      :y-ticks="[0, 100, 200, 300]"
      :curve="'smooth'"
      style="height: 150px;"
      @date-hover="handleDateHover"
      @enter="handleEnter"
      @leave="handleLeave" />
    <multi-line
      v-show="chartPrice"
      :svg-height="60"
      :line-domains="chartOptions.domains"
      :dataset="priceDataset"
      :y-max="-1000"
      :y-min="0"
      :date-hovered="chartOptions.dateHovered"
      :zoom-range="chartOptions.zoomRange"
      :x-ticks="chartOptions.xTicks"
      :x-shades="chartOptions.xShades"
      :y-log="true"
      :y-invert="true"
      :y-tick-text="true"
      :y-ticks="[-50, -500, -1000]"
      :curve="'smooth'"
      class="dash-stroke-lines"
      @date-hover="handleDateHover"
      @enter="handleEnter"
      @leave="handleLeave" />
    
  </chart-wrapper>
</template>

<script>
import { mapGetters } from 'vuex'
import MultiLine from '@/components/Vis/MultiLine'
import ChartWrapper from '@/components/Vis/ChartWrapper'

export default {
  components: {
    ChartWrapper,
    MultiLine
  },
  props: {
    domains: {
      type: Array,
      default: () => []
    },
    hoverValues: {
      type: Array,
      default: () => []
    },
    hoverDate: {
      type: String,
      default: () => ''
    },
    chartOptions: {
      type: Object,
      default: () => null
    }
  },
  computed: {
    ...mapGetters({
      priceDataset: 'region/priceDataset',
      priceAbove300Dataset: 'region/priceAbove300Dataset',
      priceBelow0Dataset: 'region/priceBelow0Dataset',
      chartPrice: 'chartPrice'
    })
  },
  methods: {
    handleDateHover(date) {
      this.$emit('date-hover', date)
    },
    handleEnter() {
      this.$store.commit('visInteract/isHovering', true)
    },
    handleLeave() {
      this.$store.commit('visInteract/isHovering', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.dash-stroke-lines ::v-deep {
  .line-path-group path {
    stroke-dasharray: 1.5;
  }
  .y-axis .tick text {
    font-size: 7px;
    fill: #666;
  }
}
</style>
