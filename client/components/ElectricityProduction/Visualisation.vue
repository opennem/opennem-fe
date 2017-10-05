<template>
  <div class="fuel-tech-chart-wrapper">
    <div :id="id" class="chart"></div>
    <SummaryTable :series="series"></SummaryTable>
  </div>
</template>

<script>
import echartDataTransform from '../../utils/EchartDataTransform'
import { ChartConfig } from './ChartConfig'
import Summary from './Summary'

export default {
  components: {
    SummaryTable: Summary
  },
  props: {
  	genData: Object
  },
  data() {
    const tooltipFormatter = function(params, ticket, callback) {
      this.updateTime(params)
      return ''
    }.bind(this)

    let config = Object.assign({}, ChartConfig)
    config.tooltip.formatter = tooltipFormatter

  	return {
  		id: `fuel-tech-${this._uid}`,
      chart: null,
      series: [{date: ''}],
      eData: null,
      area: config
  	}
  },
  watch: {
    genData: function() {
      this.eData = echartDataTransform(this.genData)
      this.area.xAxis[0].data = this.eData.dates
      this.area.xAxis[1].data = this.eData.dates
      this.area.series = this.eData.series
      // this.area.legend.data = this.eData.groups
      this.area.color = this.eData.colours
      this.series = this.eData.series.map((item) => {
        return {
          name: item.name,
          label: item.label,
          sum: item.dataSum.toFixed(2),
          colour: item.colour,
          date: ''
        }
      })

      // this.eData.series.forEach((item) => {
      //  this.series[item.name] = {
      //    name: item.name,
      //    sum: item.dataSum.toFixed(2),
      //    colour: item.colour,
      //    value: 0,
      //  }
      // })

      this.chart.setOption(this.area);
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.id))

    window.onresize = (event) => {
      this.chart.resize()
    };
  },
  methods: {
    updateTime: function(params) {
      try {
        params.forEach((param) => {
          const name = param.seriesName
          const item = this.series.find((item) => {
            return item.name === name
          })

          item.value = param.data
          item.date = param.axisValue

        })
      } catch(e) {
        console.log(e)
      }
    }
  },
}

</script>

<style scoped>
.fuel-tech-chart-wrapper {
  display: flex;
}

.chart {
  width: 100%;
  height: 600px;
}
</style>
