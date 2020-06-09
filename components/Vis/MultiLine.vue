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
        class="dot-group" />
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
import { scaleOrdinal, scaleLinear, scaleTime, scaleSymlog } from 'd3-scale'
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
    svgHeight: {
      type: Number,
      default: () => 200
    },
    marginTop: {
      type: Number,
      default: () => 0
    },
    marginRight: {
      type: Number,
      default: () => 10
    },
    marginBottom: {
      type: Number,
      default: () => 1
    },
    marginLeft: {
      type: Number,
      default: () => 10
    },
    lineDomains: {
      type: Array,
      default: () => []
    },
    highlightDomain: {
      type: String,
      default: () => null
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
    xTicks: {
      type: Function,
      default: () => null
    },
    yTicks: {
      type: Array,
      default: () => []
    },
    xShades: {
      type: Array,
      default: () => []
    },
    yLog: {
      type: Boolean,
      default: () => false
    },
    yInvert: {
      type: Boolean,
      default: () => false
    },
    yTickText: {
      type: Boolean,
      default: () => true
    },
    pathStrokeWidth: {
      type: Number,
      default: () => 1.5
    }
  },

  data() {
    return {
      svgWidth: 0,
      width: 0,
      height: 0,
      x: null,
      y: null,
      z: null,
      xAxis: null,
      yAxis: null,
      yRange: null,
      line: null,
      $xAxisGroup: null,
      $yAxisGroup: null,
      $linePathGroup: null,
      $dotGroup: null,
      $cursorLineGroup: null,
      $hoverGroup: null,
      $xShadesGroup: null
    }
  },

  computed: {
    id() {
      return `multi-line-${this.uuid}`
    },
    dotsData() {
      const dotsData = []
      this.dataset.forEach(d => {
        this.keys.forEach(k => {
          dotsData.push({
            date: d.date,
            value: d[k],
            key: k,
            colour: this.colours[k]
          })
        })
      })
      return dotsData
    },
    axisTransform() {
      return `translate(${this.marginLeft},0)`
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
    },
    hasHighlight() {
      return this.highlightDomain ? true : false
    }
  },

  watch: {
    lineDomains() {
      this.clearCursorLine()
      this.draw()
    },
    dataset() {
      this.handleResize()
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
    xTicks(newTicks) {
      this.xAxis.ticks(newTicks)
      this.redraw()
    },
    highlightDomain(domain) {
      if (domain) {
        this.$linePathGroup
          .selectAll('path')
          .attr('opacity', d => (d === domain ? 1 : 0.2))
      } else {
        this.$linePathGroup.selectAll('path').attr('opacity', 1)
      }
    },
    curveType(type) {
      this.line.curve(type)
      this.redraw()
    }
  },

  mounted() {
    this.setupWidthHeight()
    this.setup()

    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    handleResize() {
      this.setupWidthHeight()
      this.setup()
      this.draw()
    },
    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      const width = chartWidth - this.marginLeft - this.marginRight
      const height = this.svgHeight - this.marginTop - this.marginBottom

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
      this.yRange = this.yInvert ? [0, this.height] : [this.height, 0]
      this.x = scaleTime().range([0, this.width])
      this.y = this.yLog
        ? scaleSymlog().range(this.yRange)
        : scaleLinear().range(this.yRange)
      this.z = scaleOrdinal()

      // Axis
      this.xAxis = axisBottom(this.x).tickSize(this.height)
      this.yAxis =
        this.yTicks.length > 0
          ? axisLeft(this.y)
              .tickSize(-this.width)
              .tickValues(this.yTicks)
          : axisLeft(this.y)
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

      // Dots
      this.$dotGroup = $svg.select('.dot-group')

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
      $svg.on('mouseenter', () => {
        this.handleSvgEnter()
      })
      $svg.on('mouseleave', () => {
        this.handleSvgLeave()
      })
    },

    handleSvgEnter() {
      this.$emit('enter')
      this.$yAxisGroup.call(g =>
        g.selectAll('.y-axis .tick').style('opacity', 0.3)
      )
      // this.$xAxisGroup.call(g =>
      //   g.selectAll('.x-axis .tick').style('opacity', 0.5)
      // )
    },
    handleSvgLeave() {
      this.$emit('date-hover', null)
      this.$emit('leave')
      this.$yAxisGroup.call(g =>
        g.selectAll('.y-axis .tick').style('opacity', 1)
      )
      // this.$xAxisGroup.call(g =>
      //   g.selectAll('.x-axis .tick').style('opacity', 1)
      // )
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
          .attr('opacity', this.yTickText ? 1 : 0)
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
        .style('stroke-width', this.pathStrokeWidth)
        .style('fill', 'transparent')
        .attr('d', this.drawLinePath)

      this.drawDots()
    },

    redraw() {
      this.$xAxisGroup.call(this.drawXAxis)
      this.$linePathGroup.selectAll('path').attr('d', this.drawLinePath)
      this.$dotGroup
        .selectAll('circle')
        .attr('cx', d => this.x(d.date))
        .attr('cy', d => this.y(d.value))
      this.$xShadesGroup
        .selectAll('rect')
        .attr('x', d => this.x(d.start))
        .attr('width', d => this.x(d.end) - this.x(d.start))
    },

    drawDots() {
      this.$dotGroup.selectAll('circle').remove()
      this.$dotGroup
        .selectAll('circle')
        .data(this.dotsData)
        .enter()
        .append('circle')
        .attr('cx', d => this.x(d.date))
        .attr('cy', d => this.y(d.value))
        .attr('r', 3)
        .attr('fill', d => d.colour)
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

      // Draw bucket
      if (nextDate) {
        const nextXDate = this.x(nextDate)
        const bandwidth = Math.abs(nextXDate - xDate)

        this.$cursorLineGroup
          .select('rect')
          .attr('x', xDate)
          .attr('width', bandwidth)
          .attr('height', this.height)
      }
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
