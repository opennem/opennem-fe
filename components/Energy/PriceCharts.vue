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

    <!-- <multi-line
            v-show="chartPrice"
            :margin-bottom="0"
            :line-domains="domains"
            :dataset="priceDataset"
            :y-max="priceMax"
            :y-min="priceMin"
            :date-hovered="dateHovered"
            :zoom-range="zoomRange"
            :ticks="ticks"
            :x-shades="xShades"
            :curve="'linear'"
            @date-hover="handleDateHover"
            @enter="handleEnter"
            @leave="handleLeave" /> -->

    <div class="region-price-charts">
      <div 
        v-for="(d, i) in chartOptions.domains" 
        :key="i" 
        class="region-price-chart">
        <multi-line
          v-show="chartPrice"
          :svg-height="50"
          :line-domains="[d]"
          :dataset="priceAbove300Dataset"
          :y-max="20000"
          :y-min="300"
          :date-hovered="chartOptions.dateHovered"
          :zoom-range="chartOptions.zoomRange"
          :ticks="chartOptions.ticks"
          :x-shades="chartOptions.xShades"
          :y-tick-text="false"
          :y-log="true"
          :curve="'step'"
          style="height: 50px; position: relative; top: 1px;"
          @date-hover="handleDateHover"
          @enter="handleEnter"
          @leave="handleLeave" />
        <multi-line
          v-show="chartPrice"
          :svg-height="80"
          :margin-bottom="0"
          :line-domains="[d]"
          :dataset="priceDataset"
          :y-max="300"
          :y-min="0"
          :date-hovered="chartOptions.dateHovered"
          :zoom-range="chartOptions.zoomRange"
          :ticks="chartOptions.ticks"
          :x-shades="chartOptions.xShades"
          :curve="'step'"
          style="height: 80px;"
          @date-hover="handleDateHover"
          @enter="handleEnter"
          @leave="handleLeave" />
        <multi-line
          v-show="chartPrice"
          :svg-height="35"
          :line-domains="[d]"
          :dataset="priceBelow0Dataset"
          :y-max="-1100"
          :y-min="-0.1"
          :date-hovered="chartOptions.dateHovered"
          :zoom-range="chartOptions.zoomRange"
          :ticks="chartOptions.ticks"
          :x-shades="chartOptions.xShades"
          :y-log="true"
          :y-invert="true"
          :y-tick-text="false"
          :curve="'step'"
          @date-hover="handleDateHover"
          @enter="handleEnter"
          @leave="handleLeave" />
      </div>
    </div>

    
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
.region-price-charts {
  // display: flex;
  // flex-wrap: wrap;

  .region-price-chart {
    // width: 100%;
  }
}
</style>
