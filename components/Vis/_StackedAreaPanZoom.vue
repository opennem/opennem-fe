<template>
  <div class="vis stacked-area-vis">
    <!-- <button @click="panZoom">Pan/Zoom</button>
    <button
      v-show="zoomed"
      class="button is-rounded is-small reset-btn"
      @click="handleReset"
    >
      Zoom Out
    </button> -->
    <svg
      :width="svgWidth"
      :height="svgHeight"
      :id="id"
      class="stacked-area-chart">
      <defs>
        <!-- where to clip -->
        <clipPath id="clip">
          <rect
            :width="width"
            :height="height"/>
        </clipPath>
      </defs>
      <!-- for the guides -->
      <g 
        :transform="gTransform"
        class="guide-group" />

      <g 
        :transform="gTransform"
        class="axis-line-group">
        <!-- x and y axis ticks/lines/text -->
        <g 
          :transform="xAxisTransform" 
          :class="xAxisClass" />
        <g :class="yAxisClass" />

        <!-- x axis layer to allow zoom in (brush) -->
        <g 
          :transform="xAxisBrushTransform" 
          class="x-axis-brush-group" />
      </g>

      <g 
        :transform="gTransform">
        <!-- hover layer to read interaction movements -->
        <g :class="hoverLayerClass">
          <rect
            :width="width"
            :height="height"/>
        </g>

        <!-- where the stacked area path will show -->
        <g class="stacked-area-group" />
      </g>

      <!-- yAxis tick text here to show above the area -->
      <g 
        :transform="gTransform"
        class="axis-text-group">
        <g :class="yAxisTickClass" />
      </g>

      <!-- cursor line and tooltip -->
      <g
        :transform="gTransform"
        class="cursor-group">
        <g :class="cursorLineGroupClass" />
      </g>

      <g
        :transform="gTransform"
        class="zoom-group">
        <rect
          :width="width"
          :height="height"/>
      </g>
    </svg>
  </div>
</template>

<script>
import { scaleOrdinal, scaleLinear, scaleTime } from 'd3-scale'
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
    // domains.colour, domain.id
    domains: {
      type: Array,
      default: () => []
    },
    startYear: {
      type: Number,
      default: () => 2000
    },
    // TODO: guide data
    guideData: {
      type: Array,
      default: () => [
        {
          start: '2019-01-20T22:00Z',
          end: '2019-01-21T06:00Z'
        }
      ]
    },
    // interval to be used for brushing snap
    interval: {
      type: String,
      default: () => '30m'
    },
    // OPTIONAL: height for the chart
    visHeight: {
      type: Number,
      default: () => CONFIG.DEFAULT_SVG_HEIGHT
    },
    // OPTIONAL: whether it is a step curve
    step: {
      type: Boolean,
      default: () => false
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
      x2: null,
      y: null,
      z: null,
      g: null,
      guides: null,
      xAxis: null,
      xDomainExtent: null,
      yAxis: null,
      area: null,
      colours: schemeCategory10,
      stack: null,
      brushX: null,
      zoom: null,
      zoomed: false,
      $xAxisGroup: null,
      $xAxisBrushGroup: null,
      $yAxisGroup: null,
      $yAxisTickGroup: null,
      $hoverLayer: null,
      $zoomLayer: null,
      $cursorLineGroup: null,
      // guideGroup: null,
      $stackedAreaGroup: null,
      // guideGroupClass: 'guide-group',
      xAxisClass: CONFIG.X_AXIS_CLASS,
      xAxisBrushGroupClass: CONFIG.X_AXIS_BRUSH_GROUP_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      yAxisTickClass: CONFIG.Y_AXIS_TICK_CLASS,
      stackedAreaPathClass: CONFIG.CHART_STACKED_AREA_PATH_CLASS,
      stackedAreaGroupClass: CONFIG.CHART_STACKED_AREA_GROUP_CLASS,
      hoverLayerClass: CONFIG.HOVER_LAYER_CLASS,
      cursorLineGroupClass: CONFIG.CURSOR_LINE_GROUP_CLASS,
      cursorLineClass: CONFIG.CURSOR_LINE_CLASS,
      cursorLineTextClass: CONFIG.CURSOR_LINE_TEXT_CLASS,
      cursorLineRectClass: CONFIG.CURSOR_LINE_RECT_CLASS,
      pan: false
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
      return `translate(${this.margin.left},${this.margin.top})`
    },
    xAxisTransform() {
      return `translate(0, ${this.height})`
    },
    xAxisBrushTransform() {
      return `translate(0, ${this.height})`
    }
  },

  watch: {
    dataset() {
      this.zoomed = false
      this.update()
      this.resizeRedraw()
    },
    visHeight(newValue) {
      this.svgHeight = newValue
      this.handleResize()
    }
  },

  created() {
    this.svgHeight = this.visHeight
  },

  mounted() {
    window.addEventListener(
      'resize',
      debounce(this.handleResize, CONFIG.DEBOUNCE_MILLISECONDS)
    )

    this.setupWidthHeight()
    this.setup()
    setupSignals(this.id, this.width, this.height, this.x, this.dataset) // Eventbus signals
    this.update()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    destroySignals()
  },

  methods: {
    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      this.svgWidth = chartWidth
      this.width = chartWidth - this.margin.left - this.margin.right
      this.height = this.svgHeight - this.margin.top - this.margin.bottom
    },

    setup() {
      // Select the svg groups for this vis instance
      const self = this
      const $svg = select(`#${this.id}`)
      this.$hoverLayer = $svg.select(`.${this.hoverLayerClass}`)
      this.$zoomLayer = $svg.select('.zoom-group rect')
      this.$cursorLineGroup = $svg.select(`.${this.cursorLineGroupClass}`)
      this.$xAxisGroup = $svg.select(`.${this.xAxisClass}`)
      this.$xAxisBrushGroup = $svg.select(`.${this.xAxisBrushGroupClass}`)
      this.$yAxisGroup = $svg.select(`.${this.yAxisClass}`)
      this.$yAxisTickGroup = $svg.select(`.${this.yAxisTickClass}`)
      // this.guideGroup = select(`#${this.id} .${this.guideGroupClass}`)

      // Define x, y, z scale types
      this.x = scaleTime().range([0, this.width])
      this.x2 = scaleTime().range([0, this.width])
      this.y = scaleLinear().range([this.height, 0])
      this.z = scaleOrdinal()

      // Set up where x, y axis appears
      this.xAxis = axisBottom(this.x)
        .tickSize(-this.height)
        .tickFormat(d => axisTimeFormat(d))
      this.yAxis = axisRight(this.y)
        .tickSize(this.width)
        // .ticks(10)
        .tickFormat(d => format(CONFIG.Y_AXIS_FORMAT_STRING)(d))

      // Setup the 'brush' area and event handler
      this.brushX = brushX()
        .extent([[0, 0], [this.width, 40]])
        .on('brush end', this.brushEnded)

      this.zoom = d3Zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [this.width, this.height]])
        .extent([[0, 0], [this.width, this.height]])
        .on('zoom', this.vizZoomed)

      // This is a stacked area
      this.stack = stack()

      // Define the area's x value and y0,y1 values
      this.area = area()
        .x(d => this.x(d.data.date))
        .y0(d => this.y(d[0]))
        .y1(d => this.y(d[1]))

      // Create hover line and date
      this.$cursorLineGroup.append('path').attr('class', this.cursorLineClass)
      this.$cursorLineGroup
        .append('rect')
        .attr('class', this.cursorLineRectClass)
      this.$cursorLineGroup
        .append('text')
        .attr('class', this.cursorLineTextClass)

      // Event handling
      $svg.on('mouseenter', () => {
        this.$cursorLineGroup.attr('opacity', 1)
        EventBus.$emit('vis.mouseenter')
      })
      $svg.on('mouseleave', () => {
        this.$cursorLineGroup.attr('opacity', 0)
        EventBus.$emit('vis.mouseleave')
      })

      // this.$hoverLayer.on('touchmove mousemove', function() {
      //   EventBus.$emit(
      //     'vis.mousemove',
      //     this,
      //     self.dataset,
      //     self.getXAxisDateByMouse(this)
      //   )
      //   EventBus.$emit('vis.areaover', null)
      // })
      this.$zoomLayer.call(this.zoom)
      this.brushX.on('brush', function() {
        EventBus.$emit(
          'vis.mousemove',
          this,
          self.dataset,
          self.getXAxisDateByMouse(this)
        )
        EventBus.$emit('vis.areaover', null)
      })
    },

    update() {
      const self = this
      this.$stackedAreaGroup = select(
        `#${this.id} .${this.stackedAreaGroupClass}`
      )

      // Remove previous stacked area
      const ex = extent(this.dataset, d => d.date)
      this.xDomainExtent = ex
      this.x.domain(this.xDomainExtent)
      this.x2.domain(ex)

      this.y
        .domain([
          min(this.dataset, d => d._min),
          max(this.dataset, d => d._total)
        ])
        .nice()
      this.z.range(this.domainColours).domain(this.domainIds)

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)

      // To step or not to step
      if (this.step) {
        this.area.curve(curveStep)
      } else {
        this.area.curve(curveLinear)
      }

      this.stack
        .keys(this.domainIds)
        .value((d, key) => (d[key] ? d[key].value : 0))

      // Generate Stacked Area
      // Note: stacked area #clip path is defined in CSS (safari workaround)
      // - look in /assets/scss/vis.scss
      const stackArea = this.$stackedAreaGroup
        .selectAll(`.${this.stackedAreaPathClass}`)
        .data(this.stack(this.dataset))
      stackArea
        .enter()
        .append('path')
        .attr('id', d => d.key)
        .attr('class', `${this.stackedAreaPathClass}`)
        .attr('d', this.area)
        .style('fill', d => this.z(d.key))

      stackArea.exit().remove()

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
      this.$zoomLayer.on('touchmove mousemove', function() {
        EventBus.$emit(
          'vis.mousemove',
          this,
          self.dataset,
          self.getXAxisDateByMouse(this)
        )
        EventBus.$emit('vis.areaover', null)
      })
      this.$xAxisBrushGroup
        .selectAll('.brush')
        .on('touchmove mousemove', function() {
          EventBus.$emit(
            'vis.mousemove',
            this,
            self.dataset,
            self.getXAxisDateByMouse(this)
          )
          EventBus.$emit('vis.areaover', null)
        })
    },

    resizeRedraw() {
      this.x.range([0, this.width])
      this.y.range([this.height, 0])

      this.xAxis.tickSize(-this.height)
      this.yAxis.tickSize(this.width)

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)

      this.brushX.extent([[0, 0], [this.width, 40]])
      this.$xAxisBrushGroup.selectAll('.brush').call(this.brushX)
      this.$stackedAreaGroup.selectAll('path').attr('d', this.area)
    },

    zoomRedraw() {
      // Animate to the selected area by updating the x axis and area path
      const transition = 100
      this.$xAxisGroup.call(this.customXAxis)
      this.$stackedAreaGroup
        .selectAll('path')
        .transition(transition)
        .attr('d', this.area)
    },

    handleResize() {
      this.setupWidthHeight()
      this.resizeRedraw()
    },

    handleReset() {
      this.zoomed = false
      this.xDomainExtent = extent(this.dataset, d => d.date)
      this.x.domain(this.xDomainExtent)
      this.zoomRedraw()
      EventBus.$emit('dataset.filter', null)
    },

    brushEnded(d) {
      console.log('brushed')
      // prevent an infinite loop by not moving the brush in response to you moving the brush
      if (!event.selection) return
      const s = event.selection
      const startDate = this.x.invert(s[0])
      const endDate = this.x.invert(s[1])
      const dataRange = [
        this.snapToClosestInterval(startDate),
        this.snapToClosestInterval(endDate)
      ]

      // Get the brush selection (start/end) points -> dates
      // Set it to the current X domain
      this.xDomainExtent = dataRange
      this.x.domain(dataRange)

      // Turn off the brush selection
      selectAll('.brush').call(this.brushX.move, null)

      this.zoomed = true
      this.zoomRedraw()
      EventBus.$emit('dataset.filter', dataRange)
    },

    vizZoomed() {
      // prevent an infinite loop by not moving the brush in response to you moving the brush
      if (event.sourceEvent && event.sourceEvent.type === 'brush') return
      const t = event.transform
      const x2 = this.x2
      this.x.domain(t.rescaleX(x2).domain())
      // const updatedDomains = t.rescaleX(this.x).domain()
      // const startDate = updatedDomains[0]
      // const endDate = updatedDomains[1]
      // const dataRange = [startDate, endDate]

      // // Get the brush selection (start/end) points -> dates
      // // Set it to the current X domain
      // this.xDomainExtent = dataRange
      // this.x.domain(dataRange)

      this.zoomed = true
      this.$xAxisGroup.call(this.customXAxis)
      this.$stackedAreaGroup.selectAll('path').attr('d', this.area)
      // EventBus.$emit('dataset.filter', dataRange)
    },

    customXAxis(g) {
      const ticks = axisTimeTicks(this.xDomainExtent[1] - this.xDomainExtent[0])
      this.xAxis.ticks(ticks)

      // add secondary x axis tick label here
      const insertSecondaryAxisTick = function(d) {
        const el = select(this)
        const tFormat = timeFormat('%d %b')
        const secondaryText = axisSecondaryTimeFormat(d)
        if (secondaryText !== '') {
          el.append('tspan')
            .text(secondaryText)
            .attr('x', 2)
            .attr('dy', 12)
        }
      }

      g.call(this.xAxis)
      g.selectAll('.tick text').each(insertSecondaryAxisTick)
      g.selectAll('.tick text')
        .attr('x', 2)
        .attr('y', 5)
      g.selectAll('.tick line').attr('y1', 20)
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
    },

    panZoom() {
      console.log('clicked')
      this.pan = !this.pan

      if (this.pan) {
        const $svg = select(`#${this.id}`)
        const $zoomLayer = $svg.select('.zoom-group rect')
        const zoom = d3Zoom()
          .scaleExtent([1, Infinity])
          .translateExtent([[0, 0], [this.width, this.height]])
          .extent([[0, 0], [this.width, this.height]])
          .on('zoom', this.vizZoomed)

        $zoomLayer.call(zoom)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.stacked-area-vis {
  position: relative;
}
.reset-btn {
  position: absolute;
  right: 1rem;
  top: 2.5rem;
}
.zoom-group {
  opacity: 0.1;
}
</style>
