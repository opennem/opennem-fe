<template>
  <div class="fuel-tech-chart-wrapper">
    <div class="loader" v-if="!chartRendered"></div>
    <div id="ft-vis"></div>
    <FtSummary :tableData="summaryData" :pointData="pointData" :dateFrom="start" :dateTo="end" :showPrice="false"></FtSummary>
  </div>
</template>

<script>
import numeral from 'numeral'
import { mapGetters } from 'vuex'
import * as moment from 'moment'

import { 
  generateChartData, 
  generatePriceData, 
  generateFieldMappings,
  generateStockGraphs,
  generateChartScrollbarSettings
} from '../utils/AmchartsDataTransform'
import FtSummary from './EnergyAverageValueTable'
import { FUEL_TECH } from '../utils/FuelTechConfig'

export default {
  components: {
    FtSummary
  },
  props: {
    genData: Array
  },
  data() {
    return {
      chartRendered: false,
      chart: null,
      chartData: [],
      summaryData: [],
      pointData: {},
      start: null,
      end: null
    }
  },
  methods: {
    onZoom(event) {
      this.start = event.startDate
      this.end = event.endDate

      let filteredData = this.chartData.filter((item) => {
        return moment(item.date).isBetween(this.start, this.end)
      })


      if (filteredData[0]) {
        const summaryData = []

        Object.keys(filteredData[0]).forEach(ft => {
          if (ft !== 'date' && ft !== 'DEMAND_AND_NONSCHEDGEN' && ft !== 'RRP') {
            const totalPower = filteredData.reduce((a, b) => {
              return a + b[ft]
            }, 0)
            const dataPrice = filteredData.map((d, i) => {
              const rrp = filteredData[i]['RRP'] ? filteredData[i]['RRP'] : 0
              return d[ft] * rrp
            })
            const averagePrice = dataPrice.reduce((a, b) => a + b, 0) / totalPower

            summaryData.push({
              id: ft,
              range: {
                totalPower,
                energy: totalPower/12000,
                averagePrice
              }
            })
          }
        })

        summaryData.reverse()
        this.summaryData = summaryData
      }
      
    },
    onCursorHover(event) {
      if (typeof event.index !== 'undefined') {
        const data = event.target.categoryLineAxis.data[event.index]
        const dataContext = data.dataContext
        const pointData = {
          date: data.category,
          rrp: dataContext['RRPAverage']
        }

        Object.keys(FUEL_TECH).forEach(ft => {
          pointData[ft] = dataContext[`${ft}Average`]
        })

        this.pointData = pointData
      }
    }
  },
  watch: {
    genData(newData) {
      this.chartData = newData
      this.chart = makeChart(
        newData, 
        generateFieldMappings(),
        generateStockGraphs(),
        generateChartScrollbarSettings(),
        this
      )
      this.chartRendered = true
    },
  },
}

function makeChart(chartData, fieldMappings, stockGraphs, chartScrollbarSettings, context) {
  return AmCharts.makeChart('ft-vis', {
    type: 'stock',
    // mouseWheelScrollEnabled: true,
    mouseWheelZoomEnabled: true,
    categoryAxesSettings: {
      minPeriod: '5mm',
      startOnAxis: true,
      equalSpacing: true,
      groupToPeriods: ['5mm', '15mm', '30mm', 'hh']
    },
    chartCursorSettings: {
      pan: true,
      categoryBalloonColor: '#000',
      cursorColor: '#000',
      showNextAvailable: true
    },
    dataSets: [
      {
        dataProvider: chartData,
        categoryField: 'date',
        fieldMappings
      }
    ], 
    panelsSettings: {
      fontFamily: 'helvetica',
    },
    panels: [{
      title: 'Generation (MW)',
      showCategoryAxis: false,
      listeners: [
        {
          event: 'zoomed',
          method: context.onZoom
        },
        {
          event: 'changed',
          method: context.onCursorHover
        }
      ],
      valueAxes: [ {
        id: 'v1',
        dashLength: 6,
        zeroGridAlpha: 0,
        stackType: 'regular',
        minimum: 0,
        guides: [{ 
          includeGuidesInMinMax: false,
          value: 0,
          dashLength: 0,
          lineColor: '#000',
          lineThickness: 1,
          lineAlpha: 1
        }],
      } ],
      stockGraphs,
      stockLegend: {
        valueTextRegular: ' ',
        markerType: 'none'
      }
    }],
    chartScrollbarSettings: {
      enabled: false
    }
  })
}
</script>

<style scoped>
#ft-vis {
  width: 100%;
  height: 350px;
}

</style>
