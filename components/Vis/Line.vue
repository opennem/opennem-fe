<template>
  <div class="vis line-vis">
    <button
      v-if="zoomed && showZoomOut"
      class="button is-rounded is-small reset-btn"
      @click="handleReset"
    >
      Zoom Out
    </button>
    <svg 
      :width="svgWidth" 
      :height="svgHeight" 
      :id="id" 
      class="line-chart">
      <defs>
        <!-- where to clip -->
        <clipPath :id="`${id}-clip`">
          <rect 
            :width="width" 
            :height="height" />
        </clipPath>
      </defs>

      <g
        :transform="gTransform"
        :class="{ 'hide-x-axis-labels': !showXAxis }"
        class="axis-line-group"
      >
        <g class="x-guides-group" />

        <!-- x and y axis ticks/lines/text -->
        <g 
          v-show="hasYGuides" 
          class="y-axis-guide-group" />
        <g 
          :transform="xAxisTransform" 
          :class="xAxisClass" />

        <g 
          v-show="showYAxis" 
          :class="yAxisClass" />

        <!-- x axis layer to allow zoom in (brush) -->
        <g
          v-if="showXAxis && !readOnly"
          :transform="xAxisBrushTransform"
          class="x-axis-brush-group"
        />
      </g>

      <g :transform="gTransform">
        <!-- where the area path will show -->
        <g class="area-group" />

        <!-- where the line path will show -->
        <g class="line-group" />

        <!-- cursor line and tooltip -->
        <g 
          v-show="hoverOn" 
          class="cursor-group">
          <g :class="cursorLineGroupClass" />
        </g>
        <g class="focus-group" />

        <!-- hover layer to read interaction movements -->
        <g :class="hoverLayerClass">
          <rect 
            :width="width" 
            :height="height" />
        </g>
      </g>

      <!-- add another yAxis tick text here so it show above the vis -->
      <g 
        v-show="showYAxis" 
        :transform="gTransform" 
        class="axis-text-group">
        <g :class="yAxisTickClass" />
      </g>
    </svg>
  </div>
</template>

<script>
import _cloneDeep from 'lodash.clonedeep'
import { scaleOrdinal, scaleLinear, scaleTime, scaleSymlog } from 'd3-scale'
import { axisBottom, axisRight } from 'd3-axis'
import {
  area as d3Area,
  line,
  curveStepAfter,
  curveLinear,
  curveMonotoneX
} from 'd3-shape'
import {
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeWeek,
  timeMonth,
  timeMonday,
  timeYear,
  utcDay
} from 'd3-time'
import { extent, min, max } from 'd3-array'
import { format as d3Format } from 'd3-format'
import { select, selectAll, mouse as d3Mouse, event } from 'd3-selection'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { brushX } from 'd3-brush'
import debounce from 'lodash.debounce'

import EventBus from '~/plugins/eventBus.js'
import * as CONFIG from './shared/config.js'
import axisTimeFormat from './shared/timeFormat.js'
import axisSecondaryTimeFormat from './shared/secondaryTimeFormat.js'
import axisTimeTicks from './shared/timeTicks.js'
import DateDisplay from '~/services/DateDisplay.js'
import { getNextDateByInterval } from '@/services/datetime-helpers.js'
import millisecondsByInterval from '~/constants/millisecondsByInterval.js'
import AxisTimeFormats from '~/services/axisTimeFormats.js'
import {
  INTERVAL_5MIN,
  INTERVAL_30MIN,
  INTERVAL_DAY,
  INTERVAL_WEEK,
  INTERVAL_MONTH,
  INTERVAL_SEASON,
  INTERVAL_QUARTER,
  INTERVAL_HALFYEAR,
  INTERVAL_FINYEAR,
  INTERVAL_YEAR,
  hasIntervalFilters
} from '@/constants/interval-filters.js'

export default {
  props: {
    dataset: {
      type: Array,
      default: () => []
    },
    domainId: {
      type: String,
      default: () => ''
    },
    minDomainId: {
      type: String,
      default: () => ''
    },
    maxDomainId: {
      type: String,
      default: () => ''
    },
    valueDomainId: {
      type: String,
      default: () => ''
    },
    domainColour: {
      type: String,
      default: () => '#999'
    },
    dynamicExtent: {
      type: Array,
      default: () => []
    },
    mouseLoc: {
      type: Array,
      default: () => null
    },
    hoverDate: {
      type: Date,
      default: () => null
    },
    hoverOn: {
      type: Boolean,
      default: () => false
    },
    focusDate: {
      type: Date,
      default: () => null
    },
    focusOn: {
      type: Boolean,
      default: () => false
    },
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    },
    zoomed: {
      type: Boolean,
      default: () => false
    },
    // OPTIONAL: height for the chart
    visHeight: {
      type: Number,
      default: () => CONFIG.DEFAULT_SVG_HEIGHT
    },
    // OPTIONAL: what kind of curve
    curve: {
      type: String,
      default: () => 'linear'
    },
    // OPTIONAL: whether it is a log yAxis
    yAxisLog: {
      type: Boolean,
      default: () => false
    },
    // OPTIONAL: whether to flp the log chart
    yAxisInvert: {
      type: Boolean,
      default: () => false
    },
    // OPTIONAL: specify minimum yaxis value
    yMin: {
      type: Number,
      default: () => null
    },
    // OPTIONAL: specify maximum yaxis value
    yMax: {
      type: Number,
      default: () => null
    },
    // OPTIONAL: whether to show xAxis
    showXAxis: {
      type: Boolean,
      default: () => true
    },
    // OPTIONAL: whether to show zoom out button
    showZoomOut: {
      type: Boolean,
      default: () => true
    },
    // OPTIONAL: whether to show y axis
    showYAxis: {
      type: Boolean,
      default: () => true
    },
    // OPTIONAL: whether to show value tooltip
    showTooltip: {
      type: Boolean,
      default: () => true
    },
    showPointOnHover: {
      type: Boolean,
      default: () => false
    },
    yGuides: {
      type: Array,
      default: () => []
    },
    xGuides: {
      type: Array,
      default: () => []
    },
    yAxisTicks: {
      type: Number,
      default: () => 5
    },
    connectZero: {
      type: Boolean,
      default: () => false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    filterPeriod: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      svgWidth: 0,
      svgHeight: 0,
      width: 0,
      height: 0,
      margin: CONFIG.DEFAULT_MARGINS,
      x: null,
      y: null,
      z: null,
      yRange: null,
      xAxis: null,
      yAxis: null,
      line: null,
      area: null,
      colours: schemeCategory10,
      brushX: null,
      $xAxisGroup: null,
      $xAxisBrushGroup: null,
      $yAxisGroup: null,
      $yAxisTickGroup: null,
      $yAxisGuideGroup: null,
      $hoverLayer: null,
      $cursorLineGroup: null,
      $tooltipGroup: null,
      $lineGroup: null,
      $areaGroup: null,
      $xGuideGroup: null,
      focusGroup: null,
      linePathClass: 'line-path',
      lineGroupClass: 'line-group',
      areaPathClass: 'area-path',
      areaGroupClass: 'area-group',
      xGuideGroupClass: 'x-guides-group',
      yAxisGuideGroupClass: 'y-axis-guide-group',
      xAxisClass: CONFIG.X_AXIS_CLASS,
      xAxisBrushGroupClass: CONFIG.X_AXIS_BRUSH_GROUP_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      yAxisTickClass: CONFIG.Y_AXIS_TICK_CLASS,
      hoverLayerClass: CONFIG.HOVER_LAYER_CLASS,
      // Tooltip CSS classes
      cursorLineGroupClass: CONFIG.CURSOR_LINE_GROUP_CLASS,
      cursorLineClass: CONFIG.CURSOR_LINE_CLASS,
      cursorLineTextClass: CONFIG.CURSOR_LINE_TEXT_CLASS,
      cursorLineRectClass: CONFIG.CURSOR_LINE_RECT_CLASS,
      cursorRectClass: 'cursor-rect',
      cursorCircleClass: 'cursor-circle',
      tooltipRectHeight: 20,
      tooltipGroupClass: CONFIG.TOOLTIP_GROUP_CLASS,
      tooltipRectClass: CONFIG.TOOLTIP_RECT_CLASS,
      tooltipTextClass: CONFIG.TOOLTIP_TEXT_CLASS,
      // Focus line and rect
      focusGroupClass: 'focus-group',
      focusLineClass: 'focus-line',
      focusTopRectClass: 'focus-top-rect',
      focusBottomRectClass: 'focus-bottom-rect',
      focusRectClass: 'focus-rect'
    }
  },

  computed: {
    updatedDataset() {
      if (this.dataset.length > 0) {
        const isEnergyType =
          this.range !== '1D' && this.range !== '3D' && this.range !== '7D'
        if (isEnergyType) {
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
    },
    hasMinMax() {
      return this.minDomainId !== '' && this.maxDomainId !== ''
    },
    hasYGuides() {
      return this.yGuides.length > 0
    },
    id() {
      return `line-${this._uid}`
    },
    clipPathUrl() {
      return `url(#${this.id}-clip)`
    },
    gTransform() {
      return `translate(${this.margin.left},0)`
    },
    xAxisTransform() {
      return `translate(0, ${this.height})`
    },
    xAxisBrushTransform() {
      return `translate(0, ${this.height})`
    },
    curveType() {
      switch (this.curve) {
        case 'step':
          return curveStepAfter
        case 'smooth':
          return curveMonotoneX
        case 'linear':
        default:
          return curveLinear
      }
    },
    timeFormats() {
      switch (this.interval) {
        case INTERVAL_DAY:
          return AxisTimeFormats.intervalDayTimeFormat
        case INTERVAL_WEEK:
          return AxisTimeFormats.intervalWeekTimeFormat
        case INTERVAL_MONTH:
          return this.range === 'ALL'
            ? AxisTimeFormats.rangeAllIntervalMonthTimeFormat
            : AxisTimeFormats.intervalMonthTimeFormat
        case INTERVAL_SEASON:
        case INTERVAL_QUARTER:
        case INTERVAL_HALFYEAR:
        case INTERVAL_YEAR:
          return AxisTimeFormats.rangeAllIntervalMonthTimeFormat
        default:
          return axisTimeFormat
      }
    }
  },

  watch: {
    showXAxis() {
      this.handleResize()
    },
    updatedDataset() {
      this.update()
      this.resizeRedraw()
    },
    curve() {
      this.update()
    },
    visHeight(newValue) {
      this.svgHeight = newValue
      this.handleResize()
    },
    dynamicExtent(newExtent) {
      if (newExtent && newExtent.length) {
        this.x.domain(newExtent)
      } else {
        this.x.domain(this.datasetDateExtent)
      }
      this.zoomRedraw()
    },
    hoverDate(date) {
      this.updateCursorLineTooltip(new Date(date).getTime())
    },
    focusDate(updated) {
      if (updated) {
        this.drawFocus(updated)
      } else {
        this.hideFocus()
      }
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

    EventBus.$on('stacked-chart-resize', debounce(this.handleResize, CONFIG.DEBOUNCE_MILLISECONDS))

    this.setupWidthHeight()
    this.setup()
    this.update()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    EventBus.$off('stacked-chart-resize')
  },

  methods: {
    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      const width = chartWidth - this.margin.left - this.margin.right
      const height = this.showXAxis
        ? this.svgHeight - this.margin.top - this.margin.bottom
        : this.svgHeight - 1
      this.svgWidth = chartWidth
      this.width = width < 0 ? 0 : width
      this.height = height < 0 ? 0 : height
    },

    setup() {
      // Select the svg groups for this vis instance
      const self = this
      const $svg = select(`#${this.id}`)

      // Axis
      this.$xAxisGroup = $svg.select(`.${this.xAxisClass}`)
      this.$yAxisGroup = $svg.select(`.${this.yAxisClass}`)
      this.$yAxisTickGroup = $svg.select(`.${this.yAxisTickClass}`)
      this.$yAxisGuideGroup = $svg.select(`.${this.yAxisGuideGroupClass}`)
      this.$xGuideGroup = $svg.select(`.${this.xGuideGroupClass}`)

      // Brush
      this.$xAxisBrushGroup = $svg.select(`.${this.xAxisBrushGroupClass}`)

      // Tooltip and hover listener
      this.$hoverLayer = $svg.select(`.${this.hoverLayerClass}`)
      this.$cursorLineGroup = $svg.select(`.${this.cursorLineGroupClass}`)

      this.$focusGroup = $svg.select(`.${this.focusGroupClass}`)

      // Define x, y, z scale types
      this.yRange = this.yAxisInvert ? [0, this.height] : [this.height, 0]
      this.x = scaleTime().range([0, this.width]) // Date axis
      this.y = this.yAxisLog // Value axis
        ? scaleSymlog().range(this.yRange)
        : scaleLinear().range([this.height, 0])
      this.z = scaleOrdinal() // Colour

      // Set up where x, y axis appears
      this.xAxis = axisBottom(this.x)
        .tickSize(-this.height)
        .tickFormat((d, i) => this.timeFormats(d, i === 0))
      this.yAxis = axisRight(this.y)
        .tickSize(this.width)
        .ticks(this.yAxisTicks)
        .tickFormat((d) => d3Format(CONFIG.Y_AXIS_FORMAT_STRING)(d))

      // Setup the 'brush' area and event handler
      this.brushX = brushX()
        .extent([
          [0, 0],
          [this.width, 40]
        ])
        .on('end', this.brushEnded)

      // X Axis Brush (zoom in/out interaction)
      this.$xAxisBrushGroup.append('g').attr('class', 'brush').call(this.brushX)

      // Create hover line and date
      this.$cursorLineGroup.append('path').attr('class', this.cursorLineClass)
      this.$cursorLineGroup
        .append('rect')
        .attr('class', this.cursorLineRectClass)
      this.$cursorLineGroup
        .append('text')
        .attr('class', this.cursorLineTextClass)
      this.$cursorLineGroup
        .append('rect')
        .attr('class', this.cursorRectClass)
        .attr('opacity', 0)
      this.$cursorLineGroup
        .append('circle')
        .attr('class', this.cursorCircleClass)
        .attr('opacity', 0)

      this.$focusGroup.append('path').attr('class', this.focusLineClass)
      this.$focusGroup
        .append('rect')
        .attr('class', this.focusRectClass)
        .attr('opacity', 0)
      this.$focusGroup
        .append('rect')
        .attr('class', this.focusTopRectClass)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 5)
        .attr('height', 5)
        .attr('opacity', 0)
      this.$focusGroup
        .append('rect')
        .attr('class', this.focusBottomRectClass)
        .attr('x', 0)
        .attr('y', this.height - 5)
        .attr('width', 5)
        .attr('height', 5)
        .attr('opacity', 0)

      // Create tooltip group
      this.$tooltipGroup = this.$cursorLineGroup
        .append('g')
        .attr('class', this.tooltipGroupClass)
      // Create tooltip rect
      this.$tooltipGroup
        .append('rect')
        .attr('class', this.tooltipRectClass)
        .attr('height', this.tooltipRectHeight)
        .attr('opacity', 0)
      // Create tooltip text
      this.$tooltipGroup
        .append('text')
        .attr('class', this.tooltipTextClass)
        .attr('text-anchor', 'middle')

      // How to draw the line
      this.line = line()
        .x((d) => this.x(d.date))
        .y((d) => this.y(d[this.domainId]))
        .curve(this.curveType)

      this.line.defined((d) => d[this.domainId] || d[this.domainId] === 0)

      // How to draw the area path
      const validCheck = (value) => {
        return value || value === 0
      }
      this.area = d3Area()
        .x((d) => this.x(d.date))
        .y0((d) => {
          return validCheck(d[this.minDomainId]) &&
            validCheck(d[this.maxDomainId])
            ? this.y(d[this.minDomainId])
            : null
        })
        .y1((d) => {
          return validCheck(d[this.minDomainId]) &&
            validCheck(d[this.maxDomainId])
            ? this.y(d[this.maxDomainId])
            : null
        })
        .curve(this.curveType)

      // Event handling
      // - Control tooltip visibility for mouse entering/leaving svg
      $svg.on('mouseenter', () => {
        // this.$cursorLineGroup.attr('opacity', 1)
        EventBus.$emit('vis.mouseenter')
        this.$emit('enter')
      })
      $svg.on('mouseleave', () => {
        // this.$cursorLineGroup.attr('opacity', 0)
        EventBus.$emit('vis.mouseleave')
        this.$emit('leave')
      })
      $svg.on('click', () => {
        this.$emit('svgClick')
      })

      // - find date when on the hoverLayer or brushLayer or when brushing
      this.$hoverLayer.on('touchmove mousemove', function () {
        self.$emit('eventChange', this)
        self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
      })
      this.brushX.on('brush', function () {
        self.$emit('eventChange', this)
        self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
      })
      this.$xAxisBrushGroup
        .selectAll('.brush')
        .on('touchmove mousemove', function () {
          self.$emit('eventChange', this)
          self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
        })
    },

    update() {
      const self = this
      this.$lineGroup = select(`#${this.id} .${this.lineGroupClass}`)
      this.$areaGroup = select(`#${this.id} .${this.areaGroupClass}`)

      // Setup the x/y/z Axis domains
      // - Use dataset date range if there is none being passed into
      const xDomainExtent = this.dynamicExtent.length
        ? this.dynamicExtent
        : this.datasetDateExtent
      const minDomain = this.hasMinMax ? this.minDomainId : this.domainId
      const maxDomain = this.hasMinMax ? this.maxDomainId : this.domainId
      const yMin =
        this.yMin || this.yMin === 0
          ? this.yMin
          : min(this.updatedDataset, (d) => d[minDomain])
      const yMax =
        this.yMax || max(this.updatedDataset, (d) => d[maxDomain]) + 5

      this.x.domain(xDomainExtent)
      this.y.domain([yMin, yMax])
      this.z.range([this.domainColour]).domain([this.domainId])

      this.line.curve(this.curveType)
      this.area.curve(this.curveType)

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)
      this.$yAxisGuideGroup.call(this.guideYAxis)
      this.updateXGuides()

      // Remove existing Line and Area
      this.$lineGroup.selectAll('path').remove()
      this.$areaGroup.selectAll('path').remove()

      this.$lineGroup
        .append('path')
        .datum(this.updatedDataset)
        .attr('class', `${this.linePathClass}`)
        .attr('d', this.line)
        .style('stroke', (d) => this.z(this.domainId))
        .style('clip-path', this.clipPathUrl)
        .style('-webkit-clip-path', this.clipPathUrl)

      // Generate area
      if (this.hasMinMax) {
        this.$areaGroup
          .append('path')
          .datum(this.updatedDataset)
          .attr('class', `${this.areaPathClass}`)
          .attr('d', this.area)
          .style('fill', 'red')
          .style('fill-opacity', 0.1)
          .style('clip-path', this.clipPathUrl)
          .style('-webkit-clip-path', this.clipPathUrl)
      }

      // Event handling
      // - find date and domain
      this.$lineGroup.selectAll('path').on('touchmove mousemove', function () {
        self.$emit('eventChange', this)
        self.$emit('dateOver', this, self.getXAxisDateByMouse(this))
      })
    },

    updateXGuides() {
      const time = new Date(this.hoverDate).getTime()
      let nextDatePeriod = null
      const find = this.updatedDataset.find((d, i) => {
        const match = d.date === time
        if (match) {
          if (this.updatedDataset[i + 1]) {
            nextDatePeriod = this.updatedDataset[i + 1].date
          }
        }
        return match
      })
      const valueFormat = d3Format(',.1f')
      let value = 0
      let yValue = null
      const xDate = this.x(time)
      const nextPeriod = this.x(nextDatePeriod)
      const bandwidth =
        this.interval !== '5m' && this.interval !== '30m'
          ? nextPeriod - xDate
          : null

      if (find) {
        const dId = this.valueDomainId || this.domainId
        yValue = this.y(find[dId])
        value = valueFormat(find[dId])
      }

      this.positionCursorLine(xDate, value, yValue, bandwidth)

      // Remove Area
      this.$xGuideGroup.selectAll('rect').remove()
      this.$xGuideGroup
        .selectAll('rect')
        .data(this.xGuides)
        .enter()
        .append('rect')
        .attr('opacity', 0.05)
        .attr('x', (d) => this.x(d.start))
        .attr('width', (d) => this.x(d.end) - this.x(d.start))
        .attr('height', this.height)
    },

    updateCursorLineTooltip(date) {
      const valueFormat = d3Format(',.1f')
      const time = new Date(date).getTime()
      let nextDatePeriod = null
      const find = this.updatedDataset.find((d, i) => {
        const match = d.time ? d.time === time : d.date === time
        if (match) {
          if (this.updatedDataset[i + 1]) {
            nextDatePeriod = this.updatedDataset[i + 1].date
          }
        }
        return match
      })
      let value = 0
      let minValue = null
      let maxValue = null

      const xDate = this.x(date)
      let yValue = null
      const nextPeriod = this.x(nextDatePeriod)
      const bandwidth =
        this.interval !== '5m' && this.interval !== '30m'
          ? nextPeriod - xDate
          : null
      const fTime = DateDisplay.specialDateFormats(
        new Date(date).getTime(),
        this.range,
        this.interval,
        false,
        false,
        false,
        true
      )

      if (find) {
        const dId = this.valueDomainId || this.domainId
        yValue = this.y(find[dId])
        value = valueFormat(find[dId])
        minValue = this.minDomainId ? valueFormat(find[this.minDomainId]) : null
        maxValue = this.maxDomainId ? valueFormat(find[this.maxDomainId]) : null
      }

      if (this.showTooltip) {
        this.positionTooltip(xDate, fTime)
      }

      this.positionCursorLine(xDate, value, yValue, bandwidth)
    },

    positionCursorLine(xDate, value, yValue, bandwidth) {
      const $cursorLine = this.$cursorLineGroup.select(
        `.${this.cursorLineClass}`
      )
      const $cursorRect = this.$cursorLineGroup.select(
        `.${this.cursorRectClass}`
      )
      const $cursorCircle = this.$cursorLineGroup.select(
        `.${this.cursorCircleClass}`
      )

      if (xDate || xDate === 0) {
        if (bandwidth) {
          $cursorLine.attr('opacity', 0)
          $cursorRect
            .attr('x', xDate)
            .attr('width', bandwidth < 0 ? 0 : bandwidth)
            .attr('height', this.height)
            .attr('opacity', 1)

          if (this.showPointOnHover && parseInt(value)) {
            $cursorCircle
              .attr('cx', xDate)
              .attr('cy', yValue)
              .attr('r', 2.5)
              .attr('opacity', 1)
          } else {
            $cursorCircle.attr('opacity', 0)
          }
        } else {
          $cursorRect.attr('opacity', 0)
          $cursorCircle.attr('opacity', 0)
          $cursorLine.attr('opacity', 1).attr('d', () => {
            let d = 'M' + xDate + ',' + this.height
            d += ' ' + xDate + ',' + 0
            return d
          })
        }
      }
    },

    drawFocus(focusDate) {
      const time = new Date(focusDate).getTime()
      let nextDatePeriod = null
      const find = this.updatedDataset.find((d, i) => {
        const match = d.time === time
        if (match) {
          if (this.updatedDataset[i + 1]) {
            nextDatePeriod = this.updatedDataset[i + 1].time
          }
        }
        return match
      })
      const xDate = this.x(time)
      const nextPeriod = this.x(nextDatePeriod)
      const bandwidth =
        this.interval !== '5m' && this.interval !== '30m'
          ? nextPeriod - xDate
          : null

      const $focusLine = this.$focusGroup.select(`.${this.focusLineClass}`)
      const $focusTopRect = this.$focusGroup.select(
        `.${this.focusTopRectClass}`
      )
      const $focusBottomRect = this.$focusGroup.select(
        `.${this.focusBottomRectClass}`
      )
      const $focusRect = this.$focusGroup.select(`.${this.focusRectClass}`)
      if (bandwidth) {
        $focusLine.attr('opacity', 0)
        $focusTopRect.attr('opacity', 0)
        $focusBottomRect.attr('opacity', 0)
        $focusRect
          .attr('x', xDate)
          .attr('width', bandwidth < 0 ? 0 : bandwidth)
          .attr('height', this.height)
          .attr('opacity', 1)
          .style('pointer-events', 'none')
      } else {
        $focusRect.attr('opacity', 0)
        $focusTopRect.attr('opacity', 1).attr('x', xDate - 2.5)
        $focusBottomRect.attr('opacity', 1).attr('x', xDate - 2.5)
        $focusLine.attr('opacity', 1).attr('d', () => {
          let d = 'M' + xDate + ',' + this.height
          d += ' ' + xDate + ',' + 0
          return d
        })
      }
    },

    hideFocus() {
      const $focusLine = this.$focusGroup.select(`.${this.focusLineClass}`)
      const $focusTopRect = this.$focusGroup.select(
        `.${this.focusTopRectClass}`
      )
      const $focusBottomRect = this.$focusGroup.select(
        `.${this.focusBottomRectClass}`
      )
      const $focusRect = this.$focusGroup.select(`.${this.focusRectClass}`)
      $focusRect.attr('opacity', 0)
      $focusLine.attr('opacity', 0)
      $focusTopRect.attr('opacity', 0)
      $focusBottomRect.attr('opacity', 0)
    },

    positionTooltip(xDate, time) {
      const rectWidth = time.length * 5 + 15
      const $tooltipRect = this.$tooltipGroup.select(
        `.${this.tooltipRectClass}`
      )
      const $tooltipText = this.$tooltipGroup.select(
        `.${this.tooltipTextClass}`
      )

      $tooltipRect
        .attr('x', xDate - rectWidth / 2)
        .attr('y', this.height - this.tooltipRectHeight)
        .attr('width', rectWidth < 0 ? 0 : rectWidth)
        .attr('opacity', 1)
      $tooltipText
        .attr('x', xDate)
        .attr('y', this.height - this.tooltipRectHeight + 14)
        .text(time)

      // Tooltips to stick to left or right corners when close to the edge
      // - check for value tooltip
      if (this.mouseLoc) {
        const xMouse = this.mouseLoc[0]
        const yMouse = this.mouseLoc[1]
        const leftCutoff = rectWidth / 2
        const rightCutoff = this.width - rectWidth / 2

        if (xMouse >= rightCutoff) {
          $tooltipRect.attr('x', rightCutoff - rectWidth / 2)
          $tooltipText.attr('x', rightCutoff)
          $tooltipText.select('tspan').attr('x', rightCutoff)
        } else if (xMouse <= leftCutoff) {
          $tooltipRect.attr('x', 0)
          $tooltipText.attr('x', rectWidth / 2)
          $tooltipText.select('tspan').attr('x', rectWidth / 2)
        }
      }
    },

    // Update vis when container is resized
    handleResize() {
      this.setupWidthHeight()
      this.resizeRedraw()
    },

    handleReset() {
      this.x.domain(this.datasetDateExtent)
      this.zoomRedraw()
      this.$emit('svgClick')
      EventBus.$emit('dataset.filter', [])
    },

    resizeRedraw() {
      this.x.range([0, this.width])
      this.y.range(this.yRange)

      this.xAxis.tickSize(-this.height)
      this.yAxis.tickSize(this.width)

      this.$xAxisGroup.call(this.customXAxis)
      this.$yAxisGroup.call(this.customYAxis)
      this.$yAxisTickGroup.call(this.customYAxis)
      this.$yAxisGuideGroup.call(this.guideYAxis)
      this.updateXGuides()
      this.drawFocus(this.focusDate)

      this.brushX.extent([
        [0, 0],
        [this.width, 40]
      ])
      this.$xAxisBrushGroup.selectAll('.brush').call(this.brushX)
      this.$lineGroup.selectAll('path').attr('d', this.line)
      this.$areaGroup.selectAll('path').attr('d', this.area)
    },

    zoomRedraw() {
      // Animate to the selected area by updating the x axis and line path
      const transition = 100
      this.$xAxisGroup.call(this.customXAxis)
      this.updateXGuides()
      this.$lineGroup
        .selectAll('path')
        .transition(transition)
        .attr('d', this.line)
      this.$areaGroup
        .selectAll('path')
        .transition(transition)
        .attr('d', this.area)
      this.drawFocus(this.focusDate)
    },

    // handle when selecting the date ranges on the brush area
    brushEnded(d) {
      // prevent an infinite loop by not moving the brush in response to you moving the brush
      if (!event.selection) return

      // Turn off the brush selection
      selectAll('.brush').call(this.brushX.move, null)

      if (this.focusOn) return

      // Get the brush selection (start/end) points -> dates
      const s = event.selection
      const startDate = this.x.invert(s[0])
      const endDate = this.x.invert(s[1])
      const dateRange = [startDate, endDate]

      // Set it to the current X domain
      this.x.domain(dateRange)

      this.zoomRedraw()
      EventBus.$emit('dataset.filter', dateRange)
    },

    customXAxis(g) {
      let tickLength = null
      let className = ''
      const that = this
      const isFilter = !this.filterPeriod || this.filterPeriod !== 'All'

      if (!this.zoomed) {
        if (this.range === '1D') {
          className = 'interval-5m'
        } else if (this.range === '3D') {
          tickLength = utcDay.every(0.5)
          className = 'range-3d'
        } else if (this.range === '7D') {
          tickLength = utcDay.every(1)
        } else if (this.range === '30D') {
          const every = this.mobileScreen ? 1 : 0.5
          tickLength = timeMonday.every(every)
          if (!this.mobileScreen) {
            className = 'interval-day'
          }
        } else if (this.range === '1Y') {
          if (this.interval === 'Day') {
            const every = this.mobileScreen ? 8 : 4
            tickLength = timeMonday.every(every)
          } else if (this.interval === 'Week') {
            const every = this.mobileScreen ? 8 : 4
            tickLength = timeMonday.every(every)
          } else if (this.interval === 'Month') {
            const every = this.mobileScreen ? 2 : 1
            tickLength = timeMonth.every(every)
          }
        } else if (this.range === 'ALL') {
          const every = this.mobileScreen ? 2 : 1
          tickLength = timeYear.every(every)

          if (this.interval === 'Season') {
            className = 'interval-season'
            const periodMonth = DateDisplay.getPeriodMonth(this.filterPeriod)
            if (isFilter && periodMonth) {
              tickLength = timeMonth.filter((d) => d.getMonth() === periodMonth)
            }
          } else if (this.interval === 'Quarter') {
            className = 'interval-quarter'
            const periodMonth = DateDisplay.getPeriodMonth(this.filterPeriod)
            if (isFilter && periodMonth) {
              tickLength = timeMonth.filter((d) => d.getMonth() === periodMonth)
            }
          } else if (this.interval === 'Half Year') {
            className = 'interval-half-year'
            const periodMonth = DateDisplay.getPeriodMonth(this.filterPeriod)
            if (isFilter && periodMonth) {
              tickLength = timeMonth.filter((d) => d.getMonth() === periodMonth)
            }
          } else if (this.interval === 'Year') {
            className = 'interval-year'
          } else if (this.interval === 'Fin Year') {
            tickLength = timeMonth.filter((d) => {
              return d.getMonth() === 6
            })
            className = 'interval-fin-year'
          }
        }
      } else {
        if (this.range === '1D' || this.range === '3D' || this.range === '7D') {
          tickLength = utcDay.every(1)
        } else if (this.range === '1Y') {
          if (this.interval === 'Week') {
            tickLength = 7
          } else if (this.interval === 'Month') {
            tickLength = timeMonth.every(1)
          }
        }
      }

      if (
        isFilter &&
        (this.interval === 'Season' || this.interval === 'Quarter')
      ) {
        this.xAxis.tickFormat((d, i) => {
          const year = d.getFullYear() + ''
          const nextYear = d.getFullYear() + 1 + ''
          const yearStr =
            this.filterPeriod === 'Summer'
              ? `${year}/${nextYear.substr(2, 2)}`
              : year
          return `${yearStr}`
        })
        const periodMonth = DateDisplay.getPeriodMonth(this.filterPeriod)
        if (isFilter && periodMonth) {
          tickLength = timeMonth.filter((d) => d.getMonth() === periodMonth)
        }
      } else if (this.interval === 'Fin Year') {
        this.xAxis.tickFormat((d) => {
          const year = d.getFullYear() + 1 + ''
          return `FY${year.substr(2, 2)}`
        })
        tickLength = timeMonth.filter((d) => {
          return d.getMonth() === 6
        })
      } else {
        this.xAxis.tickFormat((d, i) => this.timeFormats(d, i === 0))
      }

      this.xAxis.ticks(tickLength)

      // add secondary x axis tick label here
      const insertSecondaryAxisTick = function (d) {
        const el = select(this)
        const secondaryText = axisSecondaryTimeFormat(d)
        if (secondaryText !== '') {
          el.append('tspan').text(secondaryText).attr('x', 2).attr('dy', 12)
        }
      }

      g.call(this.xAxis)
      g.selectAll('.tick text').each(insertSecondaryAxisTick)
      g.selectAll('.tick text').attr('x', 2).attr('y', 5)
      g.selectAll('.tick line').attr('y1', 20)
    },

    customYAxis(g) {
      g.call(this.yAxis)
      g.selectAll('.tick text').attr('x', 4).attr('dy', -4)
    },

    guideYAxis(g) {
      const yAxis = axisRight(this.y)
        .tickSize(this.width)
        .tickValues(this.yGuides)
        .tickFormat((d) => d3Format(CONFIG.Y_AXIS_FORMAT_STRING)(d))

      g.call(yAxis)

      g.selectAll('.tick line')
        .style('stroke-dasharray', '4.8')
        .style('stroke', 'rgba(0, 0, 0, 0.1)')
      g.selectAll('.tick text')
        .attr('x', 4)
        .attr('dy', -4)
        .style('color', '#444')
    },

    getXAxisDateByMouse(evt) {
      const m = d3Mouse(evt)
      const date = this.x.invert(m[0])
      return date
    }
  }
}
</script>

<style lang="scss" scoped>
.line-vis {
  position: relative;
}
.reset-btn {
  position: absolute;
  right: 1rem;
  top: 2.5rem;
}
</style>
