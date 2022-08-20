<template>
  <chart-wrapper
    :show-chart="chartPrice"
    :hover-values="hoverValues"
    :formatter="$options.filters.formatCurrency"
    state-name="chartPrice"
  >
    <template v-slot:header>
      <strong>Price</strong>

      <span 
        v-show="chartPrice" 
        class="chart-type-buttons buttons has-addons">
        <button
          :class="{ 'is-selected': curve === 'step' }"
          class="button is-small is-rounded"
          @click.stop="setCurve('step')"
        >
          step
        </button>
        <button
          :class="{ 'is-selected': curve === 'smooth' }"
          class="button is-small is-rounded"
          @click.stop="setCurve('smooth')"
        >
          curve
        </button>
      </span>
    </template>
    <template v-slot:datetime>
      {{ hoverDate }}
    </template>

    <multi-line
      v-show="showPosLogChart"
      :toggled="showPosLogChart"
      :svg-height="75"
      :margin-bottom="0"
      :domains1="chartOptions.domains"
      :highlight-domain="chartOptions.highlightDomain"
      :dataset1="priceDataset"
      :y1-max="20000"
      :y1-min="300"
      :date-hovered="chartOptions.dateHovered"
      :zoom-range="chartOptions.dateFilter"
      :x-ticks="chartOptions.xTicks"
      :x-shades="chartOptions.xShades"
      :cursor-anchor="chartOptions.cursorAnchor"
      :y1-tick-text="true"
      :y1-log="true"
      :y1-ticks="[300, 2000, 6000, 10000, 14000]"
      :curve="curve"
      :show-cursor-dots="showCursorDots"
      class="dash-stroke-lines"
      style="height: 75px"
      @date-hover="handleDateHover"
      @enter="handleEnter"
      @leave="handleLeave"
    />
    <multi-line
      v-show="chartPrice"
      :toggled="chartPrice"
      :svg-height="150"
      :margin-bottom="0"
      :domains1="chartOptions.domains"
      :highlight-domain="chartOptions.highlightDomain"
      :dataset1="priceDataset"
      :y1-max="yMax"
      :y1-min="0"
      :date-hovered="chartOptions.dateHovered"
      :zoom-range="chartOptions.dateFilter"
      :x-ticks="chartOptions.xTicks"
      :x-shades="chartOptions.xShades"
      :cursor-anchor="chartOptions.cursorAnchor"
      :y1-ticks="yTicks"
      :curve="curve"
      :show-cursor-dots="showCursorDots"
      style="height: 150px"
      @date-hover="handleDateHover"
      @enter="handleEnter"
      @leave="handleLeave"
    />
    <multi-line
      v-show="showNegLogChart"
      :toggled="showNegLogChart"
      :svg-height="60"
      :domains1="chartOptions.domains"
      :highlight-domain="chartOptions.highlightDomain"
      :dataset1="priceDataset"
      :y1-max="-1000"
      :y1-min="0"
      :date-hovered="chartOptions.dateHovered"
      :zoom-range="chartOptions.dateFilter"
      :x-ticks="chartOptions.xTicks"
      :x-shades="chartOptions.xShades"
      :cursor-anchor="chartOptions.cursorAnchor"
      :y1-log="true"
      :y1-invert="true"
      :y1-tick-text="true"
      :y1-ticks="[-50, -500, -1000]"
      :curve="curve"
      :show-cursor-dots="showCursorDots"
      class="dash-stroke-lines"
      @date-hover="handleDateHover"
      @enter="handleEnter"
      @leave="handleLeave"
    />
  </chart-wrapper>
</template>

<script>
import { mapGetters } from 'vuex'
import { min, max } from 'd3-array'
import MultiLine from '@/components/Vis/MultiLine'
import ChartWrapper from '@/components/Vis/_wip/ChartWrapper'

export default {
  components: {
    ChartWrapper,
    MultiLine
  },
  props: {
    priceDataset: {
      type: Array,
      default: () => []
    },
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
  data() {
    return {
      curve: 'step'
    }
  },
  computed: {
    ...mapGetters({
      chartPrice: 'chartOptionsPrice/chartShown'
    }),
    priceMin() {
      return min(this.priceDataset, (d) => d._lowest)
    },
    priceMax() {
      return max(this.priceDataset, (d) => d._highest)
    },
    yMax() {
      if (this.showPosLogChart) {
        return 300
      }
      if (this.priceMax < 100) {
        return 100
      }
      return this.priceMax
    },
    yTicks() {
      return this.showPosLogChart ? [0, 100, 200, 300] : []
    },
    showNegLogChart() {
      return this.chartPrice && this.priceMin < 0
    },
    showPosLogChart() {
      return this.chartPrice && this.priceMax > 300
    },
    showCursorDots() {
      return this.curve === 'step' ? false : true
    }
  },
  methods: {
    handleDateHover(evt, date) {
      this.$emit('date-hover', evt, date)
    },
    handleEnter() {
      this.$store.commit('visInteract/isHovering', true)
    },
    handleLeave() {
      this.$store.commit('visInteract/isHovering', false)
    },
    setCurve(curve) {
      this.curve = curve
    }
  }
}
</script>

<style lang="scss" scoped>
.dash-stroke-lines :deep(.line-left-path-group path) {
  stroke-dasharray: 1.5;
}

.dash-stroke-lines :deep(.y-axis-left-text .tick text) {
  font-size: 7px;
  fill: #666;
}

.chart-type-buttons {
  display: inline-block;
  position: relative;
  top: -2px;
  margin-left: 0.5rem;
  .button {
    padding: 2px 10px;
    min-width: 0;
    height: auto;
  }
}
</style>
