<template>
  <div class="vis multi-line-vis">
    <svg 
      :width="svgWidth"
      :height="svgHeight"
      :id="id">
      
      <g 
        :transform="axisTransform" 
        class="x-axis" />
      <g 
        :transform="axisTransform" 
        class="y-axis" />
      <g 
        :transform="axisTransform" 
        class="x-shades" />
      <g 
        :transform="axisTransform" 
        class="line-path-group" />
      <g 
        :transform="axisTransform" 
        class="cursor-line-group" />
      <g 
        :transform="axisTransform" 
        class="hover-group" />
    </svg>
  </div>
</template>

<script>
import { select, mouse } from 'd3-selection'
import { scaleOrdinal, scaleLinear, scaleTime } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import {
  line as d3Line,
  curveStepAfter,
  curveLinear,
  curveMonotoneX
} from 'd3-shape'
import { extent } from 'd3-array'

export default {
  props: {
    lineDomains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    yMin: {
      type: Number,
      default: () => 0
    },
    yMax: {
      type: Number,
      default: () => 300
    },
    curve: {
      type: String,
      default: () => 'smooth'
    },
    dateHovered: {
      type: Date,
      default: () => null
    },
    zoomRange: {
      type: Array,
      default: () => []
    },
    ticks: {
      type: Function,
      default: () => null
    },
    xShades: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      svgWidth: 0,
      svgHeight: 200,
      width: 0,
      height: 0,
      margin: { left: 10, right: 10, top: 0, bottom: 1 },
      x: null,
      y: null,
      z: null,
      xAxis: null,
      yAxis: null,
      line: null,
      $xAxisGroup: null,
      $yAxisGroup: null,
      $linePathGroup: null,
      $cursorLineGroup: null,
      $hoverGroup: null,
      $xShadesGroup: null
    }
  },

  computed: {
    id() {
      return `multi-line-${this.uuid}`
    },
    axisTransform() {
      return `translate(${this.margin.left},0)`
    },
    curveType() {
      switch (this.curve) {
        case 'step':
          return curveStepAfter
        case 'linear':
          return curveLinear
        case 'smooth':
        default:
          return curveMonotoneX
      }
    },
    keys() {
      return this.lineDomains.map(d => d.domain)
    },
    colours() {
      const dict = {}
      this.lineDomains.forEach(d => {
        dict[d.domain] = d.colour
      })
      return dict
    },
    xExtent() {
      return extent(this.dataset, d => new Date(d.date))
    }
  },

  watch: {
    dataset() {
      this.clearCursorLine()
      this.draw()
    },
    dateHovered(newValue) {
      this.drawCursorLine(newValue)
    },
    zoomRange(newRange) {
      if (newRange.length === 0) {
        this.x.domain(this.xExtent)
      } else {
        this.x.domain(newRange)
      }
      this.redraw()
    },
    ticks(newTicks) {
      this.xAxis.ticks(newTicks)
      this.redraw()
    }
  },

  mounted() {
    this.setupWidthHeight()
    this.setup()
  },

  methods: {
    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      const width = chartWidth - this.margin.left - this.margin.right
      const height = this.svgHeight - this.margin.top - this.margin.bottom

      this.svgWidth = chartWidth
      this.width = width < 0 ? 0 : width
      this.height = height < 0 ? 0 : height
    },

    setup() {
      const self = this
      const $svg = select(`#${this.id}`)
      // Axis DOM
      this.$xAxisGroup = $svg.select('.x-axis')
      this.$yAxisGroup = $svg.select('.y-axis')

      // Define scales
      this.x = scaleTime().range([0, this.width])
      this.y = scaleLinear()
        .range([this.height, 0])
        .nice()
      this.z = scaleOrdinal()

      // Axis
      this.xAxis = axisBottom(this.x).tickSize(this.height)
      this.yAxis = axisLeft(this.y)
        .tickSize(-this.width)
        .ticks(5)

      // Shades
      this.$xShadesGroup = $svg.select('.x-shades')

      // Line
      this.$linePathGroup = $svg.select('.line-path-group')
      this.line = d3Line()
        .x(d => this.x(d.date))
        .y(d => this.y(d.value))
        .curve(this.curveType)
      this.line.defined(d => d.value || d.value === 0)

      // Hover
      this.$hoverGroup = $svg.select('.hover-group')
      this.$hoverGroup
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height)
      this.$cursorLineGroup = $svg.select('.cursor-line-group')
      this.$cursorLineGroup.append('rect')

      // Events
      this.$hoverGroup.on('touchmove mousemove', function() {
        const date = self.getXAxisDateByMouse(this)
        self.$emit('date-hover', date)
      })
    },

    draw() {
      this.x.domain(this.xExtent)
      this.y.domain([this.yMin, this.yMax])

      this.$xAxisGroup.call(this.drawXAxis)
      this.$yAxisGroup.call(this.yAxis).call(g =>
        g
          .selectAll('.y-axis .tick text')
          .attr('dx', 5)
          .attr('dy', -2)
      )

      this.$xShadesGroup.selectAll('rect').remove()
      this.$xShadesGroup
        .selectAll('rect')
        .data(this.xShades)
        .enter()
        .append('rect')
        .attr('opacity', 0.05)
        .attr('x', d => this.x(d.start))
        .attr('width', d => this.x(d.end) - this.x(d.start))
        .attr('height', this.height)

      this.$linePathGroup.selectAll('path').remove()
      this.$linePathGroup
        .selectAll('path')
        .data(this.keys)
        .enter()
        .append('path')
        .attr('class', key => `${key}-path`)
        .style('stroke', key => this.colours[key])
        .style('fill', 'transparent')
        .attr('d', this.drawLinePath)
    },

    redraw() {
      this.$xAxisGroup.call(this.drawXAxis)
      this.$linePathGroup
        .selectAll('path')
        .transition(100)
        .attr('d', this.drawLinePath)
      this.$xShadesGroup
        .selectAll('rect')
        .transition(100)
        .attr('x', d => this.x(d.start))
        .attr('width', d => this.x(d.end) - this.x(d.start))
    },

    drawXAxis(g) {
      const self = this
      g.call(this.xAxis)
      g.selectAll('.x-axis .tick text').remove()
    },

    drawLinePath(key) {
      const data = this.dataset.map(d => {
        return {
          date: d.date,
          value: d[key]
        }
      })
      return this.line(data)
    },

    drawCursorLine(date) {
      const xDate = this.x(date)
      let nextDate = null
      const dataPoint = this.dataset.find((d, i) => {
        const match = d.date === date.getTime()
        const nextDataPoint = this.dataset[i + 1]
        if (match && nextDataPoint) {
          nextDate = nextDataPoint.date
        }
        return match
      })
      const nextXDate = this.x(nextDate)
      const bandwidth = Math.abs(nextXDate - xDate)

      this.$cursorLineGroup
        .select('rect')
        .attr('x', xDate)
        .attr('width', bandwidth)
        .attr('height', this.height)
    },

    clearCursorLine() {
      this.$cursorLineGroup
        .select('rect')
        .attr('width', 0)
        .attr('height', 0)
    },

    getXAxisDateByMouse(evt) {
      const m = mouse(evt)
      const date = this.x.invert(m[0])
      return date
    }
  }
}
</script>

<style lang="scss" scoped>
.multi-line-vis ::v-deep svg {
  .y-axis .tick text {
    color: #000;
    text-anchor: start;
  }
  .hover-group rect {
    fill: transparent;
  }
  .cursor-line-group rect {
    fill: rgba(199, 69, 35, 0.1);
  }
}
</style>
