<template>
  <section>
    <!-- <div
      :id="tooltipId"
      class="tooltip">tooltip</div> -->

    <div
      :id="tooltipId"
      class="tooltip"/>

    <svg
      :id="id"
      :height="height"
      :width="width" />
  </section>
</template>

<script>
import format from 'date-fns/format'
import { format as numFormat } from 'd3-format'
import { select, mouse, event } from 'd3-selection'
import { scaleSequential, scaleLinear, scaleBand } from 'd3-scale'

export default {
  props: {
    dataset: {
      type: Array,
      default: () => []
    },
    valueProp: {
      type: String,
      default: ''
    },
    tooltipValueProp: {
      type: String,
      default: ''
    },
    svgWidth: {
      type: Number,
      default: 500
    },
    svgHeight: {
      type: Number,
      default: 50
    },
    cellHeight: {
      type: Number,
      default: null
    },
    radius: {
      type: Number,
      default: 0
    },
    divisor: {
      type: [String, Number],
      default: 100
    },
    offset: {
      type: Number,
      default: 0
    },
    colourRange: {
      type: Array,
      default: () => []
    },
    colourDomain: {
      type: Array,
      default: () => []
    },
    dateFormatString: {
      type: String,
      default: 'd MMM y'
    },
    unit: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      width: null,
      height: null
    }
  },

  computed: {
    id() {
      return `heatmap-${this._uid}`
    },
    tooltipId() {
      return `tooltip-${this._uid}`
    }
  },

  watch: {
    dataset(d) {
      this.update(d)
    },
    valueProp() {
      this.update(this.dataset)
    },
    svgWidth() {
      this.setupWidthHeight(this.dataset)
      this.update(this.dataset)
    }
  },

  mounted() {
    this.setupWidthHeight(this.dataset)
    this.setup()
    this.update(this.dataset)
  },

  methods: {
    setupWidthHeight(data) {
      const chartWidth = this.svgWidth
      const bWidth = chartWidth / data.length

      // this.cellWidth = bWidth
      // if (this.cellWidth === 0) {
      //   this.cellWidth = 1
      // }

      const width = chartWidth
      const height = this.cellHeight || this.height

      this.width = width < 0 ? 0 : width
      this.height = height < 0 ? 0 : height
    },

    setup() {
      this.$svg = select(`#${this.id}`)
      this.$tooltip = select(`#${this.tooltipId}`)
    },

    update(data) {
      const self = this
      const cellWidth = this.width / data.length
      // const barWidth = Math.floor(cellWidth)
      const barWidth = cellWidth
      const barHeight = this.height
      const colourScale = scaleLinear()
        .domain(this.colourDomain)
        .range(this.colourRange)
      const bandScale = scaleBand()
        .domain(data.map(d => d.time))
        .range([0, this.width])

      // const dataLength = this.expectedDataLength || data.length
      // this.$emit('svg-width', barWidth * dataLength)

      this.$tooltip
        .style('width', `${barWidth}px`)
        .style('height', `${barHeight}px`)

      this.$svg.selectAll('.cell').remove()
      const g = this.$svg.selectAll('.cell').data(data)

      const rect = g
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('x', (d, i) => bandScale(d.time))
        .attr('width', bandScale.bandwidth())
        .attr('height', barHeight)
        .attr('rx', this.radius)
        .style('shape-rendering', 'crispEdges')
        .style('fill', d => {
          const divisor =
            typeof this.divisor === 'string' ? d[this.valueProp] : this.divisor
          let value =
            d[this.valueProp] || d[this.valueProp] === 0
              ? (d[this.valueProp] + this.offset) / divisor
              : null

          if (typeof this.divisor === 'string') {
            value = d[this.valueProp]
          }
          return value || value === 0
            ? colourScale(value > 1 ? 1 : value)
            : 'rgba(255, 255, 255, 0.3)'
        })

      rect
        .on('mouseenter', function(d) {
          // const m = mouse(this)
          // const $this = select(this)
          const value =
            d[self.tooltipValueProp] || d[self.tooltipValueProp] === 0
              ? numFormat(',.0f')(d[self.tooltipValueProp])
              : '—'
          const date = format(d.date, self.dateFormatString)
          const valueString = `${value}${self.unit}`
          const text = `
          <b>${format(d.date, self.dateFormatString)}</b>:
          ${value}${self.unit}
        `

          self.$emit('rect-mousemove', { id: self._uid, date, valueString })

          self.$tooltip
            .style('left', bandScale(d.time) + 'px')
            .style('pointer-events', 'none')
            .style('opacity', 1)

          // $this.attr('stroke-width', 1).attr('stroke', 'red')
          // $this.style('opacity', 0.9)
          // self.$tooltip
          //   .html(text)
          //   .style('left', m[0] + 4 + 'px')
          //   .style('top', m[1] - 14 + 'px')
          //   .style('pointer-events', 'none')
          //   .style('opacity', 1)
        })
        .on('mouseout', function() {
          // const $this = select(this)
          // $this.attr('stroke-width', 0)
          // $this.style('opacity', 1)
          self.$tooltip.style('opacity', 0)
          self.$emit('rect-mouseout')
        })
    }
  }
}
</script>

<style lang="scss" scoped>
section {
  position: relative;
}
// .tooltip {
//   background: white;
//   position: absolute;
//   top: 0;
//   padding: 2px 4px;
//   border-radius: 2px;
//   opacity: 0;
// }
.tooltip {
  background: transparent;
  position: absolute;
  top: 0;
  opacity: 0;
  border: 1px solid #e34a33;
}
</style>
