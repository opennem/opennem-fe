<template>
  <div class="vis column-vis">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :id="id"
      class="column-chart">
      <g 
        :transform="gTransform"
        class="axis-line-group">
        <g
          :transform="xAxisTransform" 
          :class="xAxisClass" />

        <g :class="yAxisClass" />
      </g>
    </svg>
  </div>
</template>

<script>
import _debounce from 'lodash.debounce'
import { scaleOrdinal, scaleLinear, scaleBand } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { axisBottom, axisRight } from 'd3-axis'
import { format as d3Format } from 'd3-format'
import { select as d3Select } from 'd3-selection'

import * as CONFIG from './shared/config.js'

export default {
  props: {
    dataset: {
      type: Array,
      default: () => []
    },
    // OPTIONAL: height for the chart
    visHeight: {
      type: Number,
      default: () => CONFIG.DEFAULT_SVG_HEIGHT
    }
  },

  data() {
    return {
      svgWidth: 0,
      svgHeight: 0,
      width: 0,
      height: 0,
      x: null,
      y: null,
      z: null,
      xAxis: null,
      yAxis: null,
      column: null,
      colours: schemeCategory10,
      margin: CONFIG.DEFAULT_MARGINS,
      xAxisClass: CONFIG.X_AXIS_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      $xAxisGroup: null,
      $yAxisGroup: null
    }
  },

  computed: {
    id() {
      return `column-${this._uid}`
    },
    gTransform() {
      return `translate(${this.margin.left},0)`
    },
    xAxisTransform() {
      return `translate(0, ${this.height})`
    }
  },

  created() {
    this.svgHeight = this.visHeight
  },

  mounted() {
    window.addEventListener(
      'resize',
      _debounce(this.handleResize, CONFIG.DEBOUNCE_MILLISECONDS)
    )
    this.setupWidthHeight()
    this.setup()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      const width = chartWidth - this.margin.left - this.margin.right
      const height = this.svgHeight - 1
      this.svgWidth = chartWidth
      this.width = width < 0 ? 0 : width
      this.height = height < 0 ? 0 : height
    },

    setup() {
      // Select the svg groups for this vis instance
      const self = this
      const $svg = d3Select(`#${this.id}`)

      // Axis
      this.$xAxisGroup = $svg.select(`.${this.xAxisClass}`)
      this.$yAxisGroup = $svg.select(`.${this.yAxisClass}`)

      // Define x, y, z scale types
      this.x = scaleBand().range([0, this.width])
      this.y = scaleLinear().range([this.height, 0])
      this.z = scaleOrdinal() // Colour

      // Set up where x, y axis appears
      this.xAxis = axisBottom(this.x).tickSize(-this.height)
      this.yAxis = axisRight(this.y)
        .tickSize(this.width)
        .ticks(5)
        .tickFormat(d => d3Format(CONFIG.Y_AXIS_FORMAT_STRING)(d))
    },

    handleResize() {
      this.setupWidthHeight()
      // this.resizeRedraw()
    }
  }
}
</script>

<style lang="scss" scoped>
.column-vis {
  background-color: #ddd;
}
</style>
