<template>
  <div class="vis multi-line-vis">
    <svg 
      :width="svgWidth"
      :height="svgHeight"
      :id="id">

      <defs>
        <filter id="shadow">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1" 
            flood-color="rgba(0, 0, 0, 0.2)" />
        </filter>
      </defs>
      
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
        class="cursor-line-group" />
      <g 
        :transform="axisTransform" 
        class="hover-group" />
      <g 
        :transform="axisTransform"
        class="line-left-path-group" />
      <g 
        :transform="axisTransform"
        class="line-right-path-group" />
      <g 
        :transform="axisTransform" 
        class="y-axis-left-text" />
      <g 
        :transform="axisTransform" 
        class="y-axis-right-text" />
      
    </svg>
  </div>
</template>

<script>
import { select, mouse } from 'd3-selection'
import { scaleOrdinal, scaleLinear, scaleTime, scaleSymlog } from 'd3-scale'
import { axisBottom, axisLeft, axisRight } from 'd3-axis'
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
    domains1: {
      type: Array,
      default: () => []
    },
    domains2: {
      type: Array,
      default: () => []
    },
    highlightDomain: {
      type: String,
      default: () => null
    },
    dataset1: {
      type: Array,
      default: () => []
    },
    dataset2: {
      type: Array,
      default: () => []
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
    xShades: {
      type: Array,
      default: () => []
    },
    y1Min: {
      type: Number,
      default: () => 0
    },
    y1Max: {
      type: Number,
      default: () => 300
    },
    y1Ticks: {
      type: Array,
      default: () => []
    },
    y1Log: {
      type: Boolean,
      default: () => false
    },
    y1Invert: {
      type: Boolean,
      default: () => false
    },
    y1TickText: {
      type: Boolean,
      default: () => true
    },
    y1AxisUnit: {
      type: String,
      default: () => ''
    },
    showY2: {
      type: Boolean,
      default: () => false
    },
    y2Min: {
      type: Number,
      default: () => 0
    },
    y2Max: {
      type: Number,
      default: () => 300
    },
    y2AxisUnit: {
      type: String,
      default: () => ''
    },
    pathStrokeWidth: {
      type: Number,
      default: () => 1.5
    },
    showCursorDots: {
      type: Boolean,
      default: () => true
    },
    cursorAnchor: {
      type: String,
      default: () => 'start' // like text-anchor: start, middle, end
    },
    drawIncompleteBucket: {
      type: Boolean,
      default: () => true
    },
    toggled: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      svgWidth: 0,
      width: 0,
      height: 0,
      x: null,
      y1: null,
      y2: null,
      z: null,
      xAxis: null,
      yAxisLeft: null,
      yAxisRight: null,
      y1Range: null,
      y2Range: null,
      lineLeft: null,
      lineRight: null,
      $xAxisGroup: null,
      $yAxisGroup: null,
      $yAxisLeftTextGroup: null,
      $yAxisRightTextGroup: null,
      $lineLeftPathGroup: null,
      $lineRightPathGroup: null,
      $cursorLineGroup: null,
      $cursorRect: null,
      $cursorLine: null,
      $cursorDotsGroup: null,
      $hoverGroup: null,
      $xShadesGroup: null
    }
  },

  computed: {
    id() {
      return `multi-line-${this.uuid}`
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
    keys1() {
      return this.domains1.map(d => d.domain)
    },
    colours1() {
      const dict = {}
      this.domains1.forEach(d => {
        dict[d.domain] = d.colour
      })
      return dict
    },
    keys2() {
      return this.domains2.map(d => d.domain)
    },
    colours2() {
      const dict = {}
      this.domains2.forEach(d => {
        dict[d.domain] = d.colour
      })
      return dict
    },
    xExtent() {
      return extent(this.dataset1, d => new Date(d.date))
    },
    hasHighlight() {
      return this.highlightDomain ? true : false
    }
  },

  watch: {
    toggled(isToggle) {
      if (isToggle) {
        this.setupWidthHeight()
        this.setup()
        this.draw()
      }
    },
    showY2(show) {
      if (show) {
        this.drawDataset2()
      } else {
        this.removeDataset2()
      }
    },
    domains1(updated) {
      this.clearCursorLine()
      this.draw()
    },
    dataset1() {
      this.setupWidthHeight()
      this.setup()
      this.draw()
    },
    dateHovered(newValue) {
      this.drawCursor(newValue)
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
    highlightDomain(domain) {
      if (domain) {
        this.$lineLeftPathGroup
          .selectAll('path')
          .attr('opacity', d => (d === domain ? 1 : 0.2))
      } else {
        this.$lineLeftPathGroup.selectAll('path').attr('opacity', 1)
      }
    },
    curveType(type) {
      this.lineLeft.curve(type)
      this.redraw()
    }
  },

  mounted() {
    this.setupWidthHeight()
    this.setup()

    window.addEventListener('resize', this.handleResize)
  },

  updated() {
    console.log(`${this.uuid} update`)
    this.setupWidthHeight()
    this.setup()
    this.draw()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    handleResize() {
      this.setupWidthHeight()
      this.resize()
    },

    resize() {
      this.x.range([0, this.width])
      this.y1.range(this.y1Range)
      if (!this.y1Log) {
        this.y1.nice()
      }
      this.xAxis.tickSize(this.height)
      this.yAxisLeft.tickSize(-this.width)
      this.$xAxisGroup.call(this.drawXAxis)
      this.$yAxisGroup.call(this.drawLeftYAxis)
      this.$yAxisLeftTextGroup.call(this.drawLeftYAxisText)

      if (this.showY2) {
        this.y2.range(this.y2Range)
        this.yAxisRight.tickSize(this.width)
        this.$yAxisRightTextGroup.call(this.drawRightYAxisText)
      }

      this.$hoverGroup
        .select('rect')
        .attr('width', this.width)
        .attr('height', this.height)

      this.redrawLineShades()
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
      this.$yAxisLeftTextGroup = $svg.select('.y-axis-left-text')
      this.$yAxisRightTextGroup = $svg.select('.y-axis-right-text')

      // Define scales
      this.y1Range = this.y1Invert ? [0, this.height] : [this.height, 0]
      this.y2Range = [this.height, 0]
      this.x = scaleTime().range([0, this.width])
      this.y1 = this.y1Log
        ? scaleSymlog().range(this.y1Range)
        : scaleLinear()
            .range(this.y1Range)
            .nice()
      this.y2 = scaleLinear()
        .range(this.y2Range)
        .nice()
      this.z = scaleOrdinal()

      // Axis
      this.xAxis = axisBottom(this.x)
        .tickSize(this.height)
        .ticks(this.xTicks)
      this.yAxisLeft =
        this.y1Ticks.length > 0
          ? axisLeft(this.y1)
              .tickSize(-this.width)
              .tickValues(this.y1Ticks)
          : axisLeft(this.y1)
              .tickSize(-this.width)
              .ticks(5)
      this.yAxisRight = axisRight(this.y2)
        .tickSize(this.width)
        .ticks(5)

      // x axis shading
      this.$xShadesGroup = $svg.select('.x-shades')

      // Line
      this.$lineLeftPathGroup = $svg.select('.line-left-path-group')
      this.lineLeft = d3Line()
        .x(d => this.x(d.date))
        .y(d => this.y1(d.value))
        .curve(this.curveType)
      this.lineLeft.defined(d => d.value || d.value === 0)

      this.$lineRightPathGroup = $svg.select('.line-right-path-group')
      this.lineRight = d3Line()
        .x(d => this.x(d.date))
        .y(d => this.y2(d.value))
        .curve(curveMonotoneX)
      this.lineRight.defined(d => d.value || d.value === 0)

      // Hover
      this.$hoverGroup = $svg.select('.hover-group')
      this.$hoverGroup.select('rect').remove()
      this.$hoverGroup
        .append('rect')
        .attr('width', this.width)
        .attr('height', this.height)

      this.$cursorLineGroup = $svg.select('.cursor-line-group')
      if (!this.$cursorRect) {
        this.$cursorRect = this.$cursorLineGroup.append('rect')
      }
      if (!this.$cursorLine) {
        this.$cursorLine = this.$cursorLineGroup.append('line')
      }
      if (!this.$cursorDotsGroup) {
        this.$cursorDotsGroup = this.$cursorLineGroup.append('g')
      }

      // Events
      this.$hoverGroup.on('touchmove mousemove', function() {
        const date = self.getXAxisDateByMouse(this)
        self.$emit('date-hover', this, date)
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
    },
    handleSvgLeave() {
      this.$emit('date-hover', null)
      this.$emit('leave')
    },

    draw() {
      console.log(`${this.uuid} draw`)
      const self = this
      if (this.zoomRange.length > 0) {
        this.x.domain(this.zoomRange)
      } else {
        this.x.domain(this.xExtent)
      }
      this.y1.domain([this.y1Min, this.y1Max])
      this.y2.domain([this.y2Min, this.y2Max])
      if (!this.y1Log) {
        this.y1.nice()
      }

      this.$xAxisGroup.call(this.drawXAxis)
      this.$yAxisGroup.call(this.drawLeftYAxis)
      this.$yAxisLeftTextGroup.call(this.drawLeftYAxisText)

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

      this.$lineLeftPathGroup.selectAll('path').remove()
      this.$lineLeftPathGroup
        .selectAll('path')
        .data(this.keys1)
        .enter()
        .append('path')
        .attr('class', key => `${key}-path`)
        .style('stroke', key => this.colours1[key])
        .style('stroke-width', this.pathStrokeWidth)
        .style('filter', 'url(#shadow)')
        .style('fill', 'transparent')
        .attr('d', this.drawLineLeftPath)

      this.$lineLeftPathGroup
        .selectAll('path')
        .on('mousemove touchmove', function(d) {
          const date = self.getXAxisDateByMouse(this)
          self.$emit('date-hover', this, date)
          self.$emit('domain-hover', d)
        })

      if (this.showY2) {
        this.drawDataset2()
      }
    },

    redraw() {
      this.$xAxisGroup.call(this.drawXAxis)
      this.redrawLineShades()
    },

    redrawLineShades() {
      this.$lineLeftPathGroup.selectAll('path').attr('d', this.drawLineLeftPath)
      this.$lineRightPathGroup
        .selectAll('path')
        .attr('d', this.drawLineRightPath)
      this.$xShadesGroup
        .selectAll('rect')
        .attr('x', d => this.x(d.start))
        .attr('width', d => this.x(d.end) - this.x(d.start))
    },

    drawDataset2() {
      let y2Height = this.y1(0)
      if (y2Height <= 0 || this.domains1.length === 0) {
        y2Height = this.height
      }
      this.y2
        .range([y2Height, 0])
        .domain([this.y2Min, this.y2Max])
        .nice()
      this.$yAxisRightTextGroup.call(this.drawRightYAxisText)
      this.$lineRightPathGroup.selectAll('path').remove()
      this.$lineRightPathGroup
        .selectAll('path')
        .data(this.keys2)
        .enter()
        .append('path')
        .attr('class', key => `${key}-path`)
        .style('stroke', key => this.colours2[key])
        .style('stroke-width', 2)
        .style('filter', 'url(#shadow)')
        .style('fill', 'transparent')
        .attr('d', this.drawLineRightPath)
    },
    removeDataset2() {
      this.$lineRightPathGroup.selectAll('path').remove()
      this.$yAxisRightTextGroup.selectAll('path').remove()
      this.$yAxisRightTextGroup.selectAll('.tick').remove()
    },

    drawXAxis(g) {
      g.call(this.xAxis)
      g.selectAll('.x-axis .tick text').remove()
    },

    drawLeftYAxis(g) {
      g.call(this.yAxisLeft)
      g.selectAll('.y-axis .tick text').remove()
    },

    drawLeftYAxisText(g) {
      g.call(this.yAxisLeft)
      g.selectAll('.y-axis-left-text .tick line').remove()
      g.selectAll('.y-axis-left-text .tick text')
        .text(t => `${t}${this.y1AxisUnit}`)
        .attr('dx', 5)
        .attr('dy', -2)
        .attr('opacity', this.y1TickText ? 1 : 0)
    },

    drawRightYAxisText(g) {
      g.call(this.yAxisRight)
      g.selectAll('.y-axis-right-text .tick line').remove()
      g.selectAll('.y-axis-right-text .tick text')
        .text(t => `${t}${this.y2AxisUnit}`)
        .attr('dx', -5)
        .attr('dy', -2)
        .attr('opacity', this.y1TickText ? 1 : 0)
    },

    drawLineLeftPath(key) {
      const data = this.dataset1.map(d => {
        if (this.drawIncompleteBucket) {
          return {
            date: d.date,
            value: d[key]
          }
        }
        return {
          date: d.date,
          value: d._isIncompleteBucket ? null : d[key]
        }
      })
      return this.lineLeft(data)
    },

    drawLineRightPath(key) {
      const data = this.dataset2.map(d => {
        if (this.drawIncompleteBucket) {
          return {
            date: d.date,
            value: d[key]
          }
        }
        return {
          date: d.date,
          value: d._isIncompleteBucket ? null : d[key]
        }
      })
      return this.lineRight(data)
    },

    drawCursor(date) {
      const xDate = this.x(date)
      let nextDate = null
      const dataPoint = this.dataset1.find((d, i) => {
        const match = d.date === date.getTime()
        const nextDataPoint = this.dataset1[i + 1]
        if (match && nextDataPoint) {
          nextDate = nextDataPoint.date
        }
        return match
      })

      const nextXDate = this.x(nextDate)
      const bandwidth = Math.abs(nextXDate - xDate)

      // Draw line
      this.$cursorLine
        .attr('x1', xDate)
        .attr('y1', 0)
        .attr('x2', xDate)
        .attr('y2', this.height)
        .style('stroke', 'transparent')

      if (this.showCursorDots) {
        if (dataPoint) {
          if (!dataPoint._isIncompleteBucket) {
            const dots = this.$cursorDotsGroup
              .selectAll('circle')
              .data(this.keys1)
            dots
              .enter()
              .append('circle')
              .merge(dots)
              .attr('cx', this.x(dataPoint.date))
              .attr('cy', key => this.y1(dataPoint[key]))
              .attr('r', 2)
              .attr('fill', key => this.colours1[key])
              .exit()
              .remove()
          }
        } else {
          this.$cursorDotsGroup.selectAll('circle').remove()
        }
      }

      // Draw bucket
      if (nextDate) {
        let xPos = xDate
        // if (this.cursorAnchor === 'middle') {
        //   xPos = xDate - bandwidth / 2
        // }
        this.$cursorRect
          .attr('x', xPos)
          .attr('width', bandwidth)
          .attr('height', this.height)
      } else {
        this.clearCursorLine()
      }
    },

    clearCursorLine() {
      this.$cursorRect.attr('width', 0).attr('height', 0)
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
  .y-axis-left-text .tick text {
    color: #000;
    text-anchor: start;
  }
  .y-axis-right-text .tick text {
    color: #000;
    text-anchor: end;
  }
  .hover-group rect {
    fill: transparent;
  }
  .cursor-line-group rect {
    fill: rgba(199, 69, 35, 0.1);
  }
}
</style>
