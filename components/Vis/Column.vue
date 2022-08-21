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
      <g 
        :transform="columnTransform" 
        class="column-group" />
      <g 
        :transform="columnTransform" 
        class="column-label-group" />
    </svg>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _debounce from 'lodash.debounce'
import _sortBy from 'lodash.sortby'
import { scaleOrdinal, scaleLinear, scaleBand } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { axisBottom, axisLeft } from 'd3-axis'
import { format as d3Format } from 'd3-format'
import { select as d3Select } from 'd3-selection'
import { extent as d3Extent } from 'd3-array'

import * as CONFIG from './shared/config.js'

export default {
  props: {
    dataset: {
      type: Object,
      default: () => {}
    },
    datasetPercent: {
      type: Object,
      default: () => {}
    },
    domains: {
      type: Array,
      default: () => []
    },
    // OPTIONAL: height for the chart
    visHeight: {
      type: Number,
      default: () => 200
    },
    displayPrefix: {
      type: String,
      default: () => ''
    },
    unit: {
      type: String,
      default: () => ''
    },
    convertValue: {
      type: Function,
      default: () => function () {}
    },
    highlightDomain: {
      type: String,
      default: null
    },
    usePercentage: {
      type: Boolean,
      default: false
    },
    showXAxis: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      columnData: [],
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
      margin: { left: 10, right: 1, top: 20, bottom: 40 },
      columnGroupClass: 'column-group',
      columnLabelGroupClass: 'column-label-group',
      xAxisClass: CONFIG.X_AXIS_CLASS,
      yAxisClass: CONFIG.Y_AXIS_CLASS,
      $columnGroup: null,
      $columnLabelGroup: null,
      $xAxisGroup: null,
      $yAxisGroup: null,
      orderedDomains: []
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak'
    }),
    id() {
      return `column-${this._uid}`
    },
    gTransform() {
      return `translate(0,20)`
    },
    columnTransform() {
      return `translate(0,20)`
    },
    xAxisTransform() {
      return `translate(0, ${this.height + this.margin.top + 5})`
    },
    updatedDataset() {
      return this.usePercentage ? this.datasetPercent : this.dataset
    }
  },

  watch: {
    updatedDataset(updated) {
      if (updated) {
        this.updateColumnData()
        this.update()
      }
    },
    domains() {
      this.updateColumnData()
      this.setup()
      this.update()
    },
    unit() {
      this.updateColumnData()
      this.setup()
      this.update()
    },
    displayPrefix() {
      this.update()
    },
    highlightDomain(domain) {
      if (domain && domain !== '') {
        this.$columnGroup
          .selectAll('rect')
          .attr('opacity', (d) => (d.name === domain ? 1 : 0.2))
      } else {
        this.$columnGroup.selectAll('rect').attr('opacity', 1)
      }
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
    if (this.updatedDataset) {
      this.updateColumnData()
      this.update()
    }
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    updateColumnData() {
      this.columnData = _sortBy(
        this.domains.map((domain) => {
          const id = domain.id
          return {
            name: id,
            label: domain.label,
            value: this.updatedDataset[id]
          }
        }),
        ['value']
      )
      this.orderedDomains = this.columnData
        .map((d) => this.domains.find((domain) => domain.id === d.name))
        .reverse()
    },
    setupWidthHeight() {
      const chartWidth = this.$el.offsetWidth
      const width = chartWidth
      const height = this.svgHeight - this.margin.top - this.margin.bottom
      this.svgWidth = chartWidth
      this.width = width < 0 ? 0 : width
      this.height = height < 0 ? 0 : height
    },

    setup() {
      // Select the svg groups for this vis instance
      const $svg = d3Select(`#${this.id}`)

      // Axis
      this.$xAxisGroup = $svg.select(`.${this.xAxisClass}`)
      this.$yAxisGroup = $svg.select(`.${this.yAxisClass}`)

      // Define x, y, z scale types
      this.x = scaleBand()
        .range([30, this.width - 15])
        .padding(0.2)
      this.y = scaleLinear().range([this.height - 5, 5])
      this.z = scaleOrdinal() // Colour

      // Set up where x, y axis appears
      this.xAxis = axisBottom(this.x).tickSize(-this.height)
      this.yAxis = axisLeft(this.y)
        .tickSize(-this.width)
        .ticks(5)
        .tickFormat((d) => d3Format(CONFIG.Y_AXIS_FORMAT_STRING)(d))
    },

    update() {
      this.$columnGroup = d3Select(`#${this.id} .${this.columnGroupClass}`)
      this.$columnLabelGroup = d3Select(
        `#${this.id} .${this.columnLabelGroupClass}`
      )

      const xDomains = this.orderedDomains.map((d) => d.id)
      const zColours = this.orderedDomains.map((d) => d.colour)

      const data = this.columnData
      const yValues = data.map((d) => d.value)
      const yExtent = d3Extent(yValues)
      if (yExtent[0] > 0) {
        yExtent[0] = 0
      }
      if (yExtent[1] < 0) {
        yExtent[1] = 0
      }

      this.x.domain(xDomains)
      this.y.domain(yExtent)
      this.z.range(zColours).domain(xDomains)

      if (this.showXAxis) {
        this.$xAxisGroup.call(this.customXAxis)
      }
      this.$yAxisGroup.call(this.customYAxis)
      this.drawColumns()
      this.drawColumnLabels()
    },

    customXAxis(g) {
      g.call(this.xAxis)
      g.selectAll('.tick text')
        .style('text-anchor', 'middle')
        .text((t) => {
          const label = this.domains.find((d) => d.id === t).label
          return label || t
        })
    },

    customYAxis(g) {
      g.call(this.yAxis)
      g.selectAll('.tick text')
        .text((t) => this.formatValue(this.convertValue(t)))
        .attr('x', 4)
        .attr('dy', -4)
      g.selectAll('.tick line').attr('class', (d) => (d === 0 ? 'base' : ''))
    },

    drawColumns() {
      this.$columnGroup
        .selectAll('rect')
        .data(this.columnData)
        .join('rect')
        .attr('x', (d) => this.x(d.name))
        .attr('y', (d) => (d.value > 0 ? this.y(d.value) : this.y(0)))
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('height', (d) => Math.abs(this.y(0) - this.y(d.value)))
        .attr('width', this.x.bandwidth())
        .attr('fill', (d) => this.z(d.name))
        .attr('class', (d) => `${d.name}`)

      this.$columnGroup.selectAll('rect').on('mouseenter', (d) => {
        this.$emit('domainOver', d.name)
      })
      this.$columnGroup.selectAll('rect').on('mouseleave', (d) => {
        this.$emit('domainOver', '')
      })
    },

    drawColumnLabels() {
      this.$columnLabelGroup.selectAll('g').remove()

      const mainLabel = (d) => {
        if (d.value === 0) {
          return 'No change'
        }

        const format = (val) => this.formatValue(val)
        let value = format(this.convertValue(d.value))

        if (this.usePercentage) {
          const percent = this.datasetPercent[d.name]
          value = `${d.label}`
        }

        return value
      }

      const secondaryLabel = (d) => {
        // if (this.usePercentage) {
        //   return ''
        // }
        const bandwidth = this.x.bandwidth()
        const percent = this.datasetPercent[d.name]
        let string = ''
        // if (percent && bandwidth > 60) {
        if (percent) {
          string += `${this.formatValue(percent)}%`
        }
        return string
      }

      this.$columnLabelGroup
        .selectAll('text')
        .data(this.columnData)
        .join('text')
        .attr('x', (d) =>
          this.usePercentage
            ? this.x(d.name) + this.x.bandwidth()
            : this.x(d.name)
        )
        .attr('y', (d) => (d.value > 0 ? this.y(d.value) : this.y(0)))
        .attr('dy', (d) =>
          d.value > 0 ? -2 : Math.abs(this.y(0) - this.y(d.value)) + 12
        )
        .style('text-anchor', this.usePercentage ? 'end' : 'start')
        .style('font-size', this.tabletBreak ? '11px' : '11px')
        .text((d) => mainLabel(d))

      this.$columnLabelGroup
        .selectAll('text')
        .data(this.columnData)
        .append('tspan')
        .attr('x', (d) =>
          // ? this.x(d.name) + this.x.bandwidth() / 2
          this.usePercentage
            ? this.x(d.name) + this.x.bandwidth()
            : this.x(d.name)
        )
        .attr('dy', (d) => (d.value > 0 ? -12 : 12))
        .style('fill', '#444')
        .style('font-size', '11px')
        .style('text-anchor', this.usePercentage ? 'end' : 'start')
        .text((d) => secondaryLabel(d))
    },

    resizeRedraw() {
      this.x.range([30, this.width - 15])
      this.y.range([this.height - 5, 5])
      this.yAxis.tickSize(-this.width)

      this.$yAxisGroup.call(this.customYAxis)
      this.drawColumns()
      this.drawColumnLabels()
    },

    handleResize() {
      this.setupWidthHeight()
      this.resizeRedraw()
    },

    formatValue(val) {
      return this.$options.filters.formatValue(val)
    }
  }
}
</script>

<style lang="scss" scoped></style>
