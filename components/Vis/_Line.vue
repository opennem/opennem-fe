<template>
  <div class="vis">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :id="id"
      class="line-chart">
      <g 
        :transform="gTransform"
        class="line-group" />
      <g 
        :transform="gTransform"
        class="axis-group">
        <g 
          :transform="xAxisTransform" 
          :class="xAxisClass" />
        <g :class="yAxisClass" />
      </g>
      <g
        :transform="gTransform"
        class="cursor-group">
        <g :class="cursorLineGroupClass" />
      </g>
      <g
        :transform="gTransform"
        :class="hoverLayerClass">
        <rect
          :width="width"
          :height="height" />
      </g>
    </svg>
  </div>
</template>

<script>
import { scaleBand, scaleLinear, scaleTime } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { line } from 'd3-shape'
import { extent } from 'd3-array'
import { format } from 'd3-format'
import { select, mouse } from 'd3-selection'
import { brushX } from 'd3-brush'
import debounce from 'lodash.debounce'

import * as CONFIG from './shared/config.js'
import { setupSignals, destroySignals } from './shared/signals.js'

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    keys: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      svgWidth: 0,
      svgHeight: CONFIG.DEFAULT_SVG_HEIGHT,
      width: 0,
      height: 0,
      margin: CONFIG.DEFAULT_MARGINS,
      x: null,
      y: null,
      g: null,
      xAxis: null,
      yAxis: null,
      xAxisClass: CONFIG.X_AXIS_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      xAxisGroup: null,
      yAxisGroup: null,
      line: null,
      brush: null,
      hoverLayerClass: CONFIG.HOVER_LAYER_CLASS,
      cursorLineGroupClass: CONFIG.CURSOR_LINE_GROUP_CLASS
    }
  },

  computed: {
    id() {
      return `${CONFIG.CHART_LINE}-${this._uid}`
    },
    gTransform() {
      return `translate(${this.margin.left},${this.margin.top})`
    },
    xAxisTransform() {
      return `translate(0, ${this.height})`
    },
    testKey() {
      return this.keys[0]
    }
  },

  watch: {
    data() {
      this.update()
    }
  },

  mounted() {
    window.addEventListener(
      'resize',
      debounce(this.handleResize, CONFIG.DEBOUNCE_MILLISECONDS)
    )

    this.setupWidthHeight()
    this.setup()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    destroySignals()
  },

  methods: {
    handleResize() {
      this.redraw()
    },

    redraw() {
      this.setupWidthHeight()
      this.setup()
      this.update()
    },

    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      this.svgWidth = chartWidth
      this.width = chartWidth - this.margin.left - this.margin.right
      this.height = this.svgHeight - this.margin.top - this.margin.bottom
    },

    setup() {
      this.x = scaleTime().range([0, this.width])
      this.y = scaleLinear()
        .range([this.height, 0])
        .nice()

      this.xAxis = axisBottom(this.x)
      this.yAxis = axisLeft(this.y)
        .tickFormat(d => format(CONFIG.Y_AXIS_FORMAT_STRING)(d))
        .tickSize(-this.width)

      this.xAxisGroup = select(`#${this.id} .${this.xAxisClass}`)
      this.yAxisGroup = select(`#${this.id} .${this.yAxisClass}`)

      this.brush = brushX().extent([[0, 0], [this.width, this.height]])

      this.line = line()
        .x(d => this.x(d.date))
        .y(d => this.y(d[this.testKey].value))

      // Hover signals
      setupSignals(this.id, this.height, this.x, this.brush)
    },

    update() {
      console.log('vis update')
      const g = select(`#${this.id} .${CONFIG.CHART_LINE}-group`)

      // Remove previous path
      g.select(`.${CONFIG.CHART_LINE}`).remove()

      this.x.domain(extent(this.data, d => d.date))
      this.y.domain(extent(this.data, d => d[this.testKey].value))

      this.xAxisGroup.call(this.xAxis)
      this.yAxisGroup.call(this.yAxis)

      g.append('path')
        .datum(this.data)
        .attr('class', CONFIG.CHART_LINE)
        .attr('d', this.line)
    }
  }
}
</script>

<style lang="scss">
path.line {
  fill: none;
  stroke: #000;
  stroke-width: 1;
}
.cursor-line {
  stroke: red;
  stroke-width: 1px;
}
.hover-layer {
  fill: transparent;
}
</style>
