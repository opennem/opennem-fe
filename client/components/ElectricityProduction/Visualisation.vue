<template>
  <div class="fuel-tech-chart-wrapper">
    <div :id="id" v-on:mouseout="onChartMouseout" class="chart"></div>
    <SummaryTable :series="series" :price="price" :showTotals="showTotals"></SummaryTable>
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
      series: [{
        date: '', 
        sum: 0,
        value: 0
      }],
      price: {
        name: 'price',
        label: 'Price',
        sum: 0,
        value: 0
      },
      showTotals: true,
      eData: null,
      area: config
  	}
  },
  watch: {
    genData: function() {
      let hasOffset = null
      this.eData = echartDataTransform(this.genData)
      this.area.xAxis[0].data = this.eData.dates
      this.area.xAxis[1].data = this.eData.dates
      this.area.xAxis[2].data = this.eData.dates
      this.area.xAxis[3].data = this.eData.dates

      this.area.series = this.eData.series
      this.area.color = this.eData.colours


      this.series = this.eData.ftSeries.map((item) => {
        if (!hasOffset) {
          hasOffset = item.offset.toFixed(0)
        }
        return {
          name: item.name,
          label: item.label,
          sum: item.dataSum,
          dataPriceSum: item.dataPriceSum,
          colour: item.colour,
          offset: item.offset,
          date: '',
          value: 0,
          show: true,
          toggle: (ftRow) => {
            ftRow.show = !ftRow.show
            this.chart.dispatchAction({
              type: 'legendToggleSelect',
              name: item.name
            })
          }
        }
      })

      this.area.yAxis[0].axisLabel = {
        formatter: function(value, index) {
          return ''
        }
      }


      this.series.reverse()

      this.price.sum = this.eData.priceSeries[0].dataSum

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
          const ft = this.series.find((item) => {
            return item.name === name
          })

          if (name === 'price') {
            this.price.value = param.data
          }

          if (ft) {
            ft.value = param.data
            ft.date = param.axisValue
          }

        })
      } catch(e) {
        console.log(e)
      }

      this.showTotals = false
    },
    onChartMouseout: function(event) {
      this.eData.series.forEach((ft) => {
        ft.value = 0
      })
      this.showTotals = true
    }
  },
}

</script>

<style scoped>
.fuel-tech-chart-wrapper {
  display: block;
}

.chart {
  width: 100%;
  height: 600px;
}

@media only screen and (min-width: 769px) {
  .fuel-tech-chart-wrapper {
    display: flex;
  }
}

</style>
