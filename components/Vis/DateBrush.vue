<template>
  <div class="vis brush-vis">
    <svg 
      :width="svgWidth" 
      :height="svgHeight" 
      :id="id">
      <defs>
        <!-- where to clip -->
        <clipPath :id="`${id}-clip`">
          <rect 
            :width="width" 
            :height="height" />
        </clipPath>
      </defs>
      <g 
        :transform="axisTransform" 
        class="x-axis" />
      <g 
        v-if="!readOnly" 
        :transform="brushTransform" 
        class="brush-group" />
    </svg>
  </div>
</template>

<script>
import _cloneDeep from 'lodash.clonedeep'
import debounce from 'lodash.debounce'
import { select, mouse, event } from 'd3-selection'
import { scaleTime } from 'd3-scale'
import { axisBottom } from 'd3-axis'
import { extent } from 'd3-array'
import { brushX } from 'd3-brush'
import EventBus from '~/plugins/eventBus.js'
import { onBrush, onBrushEnded } from './shared/brushEvents'
import { getNextDateByInterval } from '@/services/datetime-helpers.js'
import * as CONFIG from './shared/config.js'

export default {
  props: {
    readOnly: {
      type: Boolean,
      default: false
    },
    dataset: {
      type: Array,
      default: () => []
    },
    zoomRange: {
      type: Array,
      default: () => []
    },
    tickFormat: {
      type: Function,
      default: () => ({})
    },
    secondTickFormat: {
      type: Function,
      default: () => ({})
    },
    xTicks: {
      type: Function,
      default: () => null
    },

    marginLeft: {
      type: Number,
      default: () => 0
    },

    interval: {
      type: String,
      default: ''
    },
    filterPeriod: {
      type: String,
      default: ''
    },
    appendDatapoint: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      svgWidth: 0,
      svgHeight: 30,
      width: 0,
      height: 0,
      margin: { left: 0, right: 0, top: 20, bottom: 10 },
      x: null,
      brushX: null,
      xAxis: null,
      $xAxisGroup: null,
      $brushGroup: null
    }
  },
  computed: {
    id() {
      return `date-brush-${this.uuid}`
    },
    clipPathUrl() {
      return `url(#${this.id}-clip)`
    },
    axisTransform() {
      return `translate(${this.marginLeft}, 0)`
    },
    brushTransform() {
      return `translate(${this.marginLeft}, 0)`
    },
    xExtent() {
      return extent(this.updatedDataset, (d) => new Date(d.date))
    },
    updatedDataset() {
      if (this.dataset.length > 0) {
        if (this.appendDatapoint) {
          const updated = _cloneDeep(this.dataset)
          const lastItem = _cloneDeep(updated[updated.length - 1])

          const nextDate = getNextDateByInterval(
            lastItem.date,
            this.interval,
            this.filterPeriod !== 'All'
          )
          lastItem.date = nextDate
          lastItem.time = nextDate.getTime()

          updated.push(lastItem)
          return updated
        }

        return this.dataset
      }
      return []
    },
    
    datasetDateExtent() {
      return extent(this.updatedDataset, (d) => new Date(d.date))
    }
  },
  watch: {
    dataset() {
      this.draw()
    },
    zoomRange(newRange) {
      if (newRange.length > 0) {
        this.x.domain(newRange)
      } else {
        this.x.domain(this.xExtent)
      }
      this.redraw()
    },
    xTicks(newTicks) {
      this.xAxis.ticks(newTicks)
      this.redraw()
    },
    tickFormat(newFormat) {
      this.xAxis.tickFormat((d, i) => newFormat(d, i === 0))
      this.redraw()
    }
  },
  mounted() {
    this.setupWidthHeight()
    this.setup()
    window.addEventListener('resize', debounce(this.handleResize, 1))
    EventBus.$on('vis-resize', this.handleResize)
  },
  updated() {
    this.setupWidthHeight()
    this.setup()
    this.draw()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    EventBus.$off('vis-resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.setupWidthHeight()
      this.resize()
    },

    resize() {
      this.x.range([0, this.width])
      this.xAxis.tickSize(this.height)
      this.$xAxisGroup.call(this.drawXAxis)
      this.brushX.extent([
        [0, 0],
        [this.width, this.svgHeight]
      ])
      this.$brushGroup.call(this.brushX)
    },

    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      const width = chartWidth - this.marginLeft - this.margin.right
      const height = this.svgHeight - this.margin.top - this.margin.bottom

      this.svgWidth = chartWidth
      this.width = width < 0 ? 0 : width
      this.height = height < 0 ? 0 : height
    },

    setup() {
      const self = this
      const $svg = select(`#${this.id}`)
      // DOM
      this.$xAxisGroup = $svg.select('.x-axis')

      // Define scales
      this.x = scaleTime().range([0, this.width]).nice()

      // Axis
      this.xAxis = axisBottom(this.x)
        .tickSize(this.height)
        .ticks(this.xTicks)
        .tickFormat((d, i) => this.tickFormat(d, i === 0))

      // Brush
      this.brushX = brushX()
        .extent([
          [0, 0],
          [this.width, this.svgHeight]
        ])
        .on('end', this.brushEnded)

      this.$brushGroup = $svg.select('.brush-group')
      this.$brushGroup.call(this.brushX)

      // Events
      this.$brushGroup.on('touchmove mousemove', function () {
        const date = self.getXAxisDateByMouse(this)
        self.$emit('date-hover', this, date)
      })
      $svg.on('mouseenter', () => {
        this.handleSvgEnter()
      })
      $svg.on('mouseleave', () => {
        this.handleSvgLeave()
      })

      this.brushX.on('brush', function () {
        if (!event.selection) return
        if (event.sourceEvent.type === 'brush') return

        const dateRange = onBrush({
          s: event.selection,
          x: self.x,
          interval: self.interval,
          filterPeriod: self.filterPeriod
        })

        select(this).call(self.brushX.move, dateRange.map(self.x))
        self.$emit('date-hover', this, self.getXAxisDateByMouse(this))
      })
    },

    handleSvgEnter() {
      this.$emit('enter')
    },
    handleSvgLeave() {
      this.$emit('date-hover', null, null)
      this.$emit('leave')
    },

    draw() {
      if (this.zoomRange.length > 0) {
        this.x.domain(this.zoomRange)
      } else {
        this.x.domain(this.xExtent)
      }
      this.$xAxisGroup.call(this.drawXAxis)
    },

    redraw() {
      this.$xAxisGroup.call(this.drawXAxis)
    },

    drawXAxis(g) {
      const self = this
      g.select('.x-axis')
        .style('clip-path', this.clipPathUrl)
        .style('-webkit-clip-path', this.clipPathUrl)
      g.call(this.xAxis)
      g.selectAll('.x-axis .tick line').attr('y2', this.svgHeight)
      g.selectAll('.x-axis .tick text').each(function (d, i) {
        const el = select(this)
        const text2 = self.secondTickFormat(d)
        el.attr('x', 2)
        // el.style('transform', 'rotate(90deg) translateY(-11px)')
        if (text2 !== '') {
          el.append('tspan')
            .text(typeof text2 === 'string' ? text2.trim() : text2)
            .attr('x', 2)
            .attr('dy', 12)
        }
      })
    },

    brushEnded() {
      // prevent an infinite loop by not moving the brush in response to you moving the brush
      if (!event.selection) {
        this.$emit('date-filter', [])
        return
      }

      // Turn off the brush selection
      this.$brushGroup.call(this.brushX.move, null)

      const dateRange = onBrushEnded({
        s: event.selection,
        x: this.x,
        interval: this.interval,
        filterPeriod: this.filterPeriod,
        datasetEndDate: this.datasetDateExtent[1]
      })
      this.$emit('date-filter', dateRange)
    },

    getXAxisDateByMouse(evt) {
      const m = mouse(evt)
      const date = this.x.invert(m[0])
      return date
    }
  }
}
</script>
