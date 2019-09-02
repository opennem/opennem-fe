<template>
  <div class="vis vis-brush">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :id="id"
      class="brush-chart">
      <g 
        :transform="gTransform"
        class="axis-line-group">
        <g 
          :transform="xAxisTransform" 
          :class="xAxisClass" />
        <g class="x-axis-brush-group" />
      </g>
    </svg>
  </div>
</template>

<script>
import { scaleLinear, scaleTime } from 'd3-scale'
import { axisBottom, axisRight } from 'd3-axis'
import { area, stack, curveStep, curveLinear, curveStepBefore } from 'd3-shape'
import { extent, min, max } from 'd3-array'
import { format } from 'd3-format'
import { select, selectAll, mouse, event } from 'd3-selection'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { brushX } from 'd3-brush'
import { zoom as d3Zoom } from 'd3-zoom'
import { timeMinute, timeDay, timeMonday, timeMonth, timeYear } from 'd3-time'
import { timeFormat } from 'd3-time-format'
import debounce from 'lodash.debounce'

import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './shared/config.js'
import { setupSignals, destroySignals } from './shared/signals.js'
import axisTimeFormat from './shared/timeFormat.js'
import axisSecondaryTimeFormat from './shared/secondaryTimeFormat.js'
import axisTimeTicks from './shared/timeTicks.js'

export default {
  props: {
    dataset: {
      type: Array,
      default: () => []
    },
    startYear: {
      type: Number,
      default: () => 2000
    }
  },

  data() {
    return {
      dIds: [],
      svgWidth: 0,
      svgHeight: 0,
      width: 0,
      height: 0,
      margin: CONFIG.DEFAULT_MARGINS,
      x: null,
      y: null,
      g: null,
      xAxis: null,
      xDomainExtent: null,
      yAxis: null,
      brushX: null,
      zoomed: false,
      $xAxisGroup: null,
      $xAxisBrushGroup: null,
      $yAxisGroup: null,
      $yAxisTickGroup: null,
      xAxisClass: CONFIG.X_AXIS_CLASS,
      xAxisBrushGroupClass: CONFIG.X_AXIS_BRUSH_GROUP_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      yAxisTickClass: CONFIG.Y_AXIS_TICK_CLASS
    }
  },

  computed: {
    domainIds() {
      return this.domains.map(d => d.id).reverse()
    },
    domainColours() {
      return this.domains.map(d => d.colour).reverse()
    },
    id() {
      return `stacked-area-${this._uid}`
    },
    gTransform() {
      return `translate(${this.margin.left},0)`
    },
    xAxisTransform() {
      return `translate(0, ${this.height})`
    },
    xAxisBrushTransform() {
      return `translate(0, ${this.height})`
    }
  },

  created() {
    this.svgHeight = 100
  },

  mounted() {
    window.addEventListener(
      'resize',
      debounce(this.handleResize, CONFIG.DEBOUNCE_MILLISECONDS)
    )

    this.setupWidthHeight()
    this.setup()
    this.update()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      this.svgWidth = chartWidth
      this.width = chartWidth - this.margin.left - this.margin.right
      this.height = this.svgHeight
    },

    setup() {
      // Select the svg groups for this vis instance
      const self = this
      const $svg = select(`#${this.id}`)
      this.$xAxisGroup = $svg.select(`.${this.xAxisClass}`)
      this.$xAxisBrushGroup = $svg.select(`.${this.xAxisBrushGroupClass}`)
      this.$yAxisGroup = $svg.select(`.${this.yAxisClass}`)
      this.$yAxisTickGroup = $svg.select(`.${this.yAxisTickClass}`)

      // Define x, y, z scale types
      this.x = scaleTime().range([0, this.width])
      this.y = scaleLinear().range([this.height, 0])

      // Set up where x, y axis appears
      this.xAxis = axisBottom(this.x).tickSize(-this.height)
      this.yAxis = axisRight(this.y)
        .tickSize(this.width)
        // .ticks(10)
        .tickFormat(d => format(CONFIG.Y_AXIS_FORMAT_STRING)(d))

      // Setup the 'brush' area and event handler
      this.brushX = brushX()
        .extent([[0, 0], [this.width, this.height]])
        .on('brush end', this.brushEnded)

      // Event handling
      // $svg.on('mouseenter', () => {
      //   this.$cursorLineGroup.attr('opacity', 1)
      //   EventBus.$emit('vis.mouseenter')
      // })
      // $svg.on('mouseleave', () => {
      //   this.$cursorLineGroup.attr('opacity', 0)
      //   EventBus.$emit('vis.mouseleave')
      // })

      this.brushX.on('brush', function() {
        // EventBus.$emit(
        //   'vis.mousemove',
        //   this,
        //   self.dataset,
        //   self.getXAxisDateByMouse(this)
        // )
      })
    },

    update() {
      const self = this

      // Remove previous stacked area
      const start = new Date('2000-01-01').getTime()
      const end = new Date('2019-06-30').getTime()
      this.xDomainExtent = [start, end]
      this.x.domain(this.xDomainExtent)
      this.y.domain([0, 100])

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)

      // X Axis Brush (zoom in/out interaction)
      this.$xAxisBrushGroup
        .append('g')
        .attr('class', 'brush')
        .call(this.brushX)

      // Event handling
      // this.$stackedAreaGroup
      //   .selectAll('path')
      //   .on('touchmove mousemove', function(d) {
      //     EventBus.$emit(
      //       'vis.mousemove',
      //       this,
      //       self.dataset,
      //       self.getXAxisDateByMouse(this)
      //     )
      //     EventBus.$emit('vis.areaover', d.key)
      //   })
      // this.$xAxisBrushGroup
      //   .selectAll('.brush')
      //   .on('touchmove mousemove', function() {
      //     console.log('brush')
      //   })
    },

    resizeRedraw() {
      this.x.range([0, this.width])
      this.y.range([this.height, 0])

      this.xAxis.tickSize(-this.height)
      this.yAxis.tickSize(this.width)

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)

      this.brushX.extent([[0, 0], [this.width, this.height]])
      this.$xAxisBrushGroup.selectAll('.brush').call(this.brushX)
    },

    zoomRedraw() {
      this.$xAxisGroup.transition(100).call(this.customXAxis)
    },

    handleResize() {
      this.setupWidthHeight()
      this.resizeRedraw()
    },

    brushEnded(d) {
      // prevent an infinite loop by not moving the brush in response to you moving the brush
      if (!event.selection) return
      console.log('brushed')
      const s = event.selection
      const startDate = this.x.invert(s[0])
      const endDate = this.x.invert(s[1])
      const dataRange = [startDate, endDate]

      // Get the brush selection (start/end) points -> dates
      // Set it to the current X domain
      this.xDomainExtent = dataRange
      this.x.domain(dataRange)

      // Turn off the brush selection
      selectAll('.brush').call(this.brushX.move, null)

      this.zoomRedraw()

      EventBus.$emit('dataset.filter', dataRange)
    },

    customXAxis(g) {
      // const ticks = axisTimeTicks(this.xDomainExtent[1] - this.xDomainExtent[0])
      // this.xAxis.ticks(ticks)

      // // add secondary x axis tick label here
      // const insertSecondaryAxisTick = function(d) {
      //   const el = select(this)
      //   const tFormat = timeFormat('%d %b')
      //   const secondaryText = axisSecondaryTimeFormat(d)
      //   if (secondaryText !== '') {
      //     el.append('tspan')
      //       .text(secondaryText)
      //       .attr('x', 2)
      //       .attr('dy', 12)
      //   }
      // }

      g.call(this.xAxis)
      // g.selectAll('.tick text').each(insertSecondaryAxisTick)
      g.selectAll('.tick text')
        .attr('x', 2)
        .attr('y', -50)
      // g.selectAll('.tick line').attr('y1', 20)
    },

    customYAxis(g) {
      g.call(this.yAxis)
      g.selectAll('.tick text')
        .attr('x', 4)
        .attr('dy', -4)
    },

    getXAxisDateByMouse(evt) {
      const m = mouse(evt)
      const date = this.x.invert(m[0])
      return this.snapToClosestInterval(date)
    },

    snapToClosestInterval(date) {
      switch (this.interval) {
        case '5m':
          return timeMinute.every(5).round(date)
        case '30m':
          return timeMinute.every(30).round(date)
        case 'Day':
          return timeDay.every(1).round(date)
        case 'Week':
          return timeMonday.every(1).round(date)
        case 'Month':
          return timeMonth.every(1).round(date)
        case 'Season':
          const quarter = timeMonth.every(3).round(date)
          return timeMonth.offset(quarter, -1)
        case 'Quarter':
          return timeMonth.every(3).round(date)
        case 'Fin Year':
          const year = timeYear.every(1).round(date)
          return timeMonth.offset(year, -6)
        case 'Year':
          return timeYear.every(1).round(date)
        default:
          return date
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
