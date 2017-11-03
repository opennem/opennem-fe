<template>
  <div class="fuel-tech-chart-wrapper">
    <div class="loader" v-if="!chartRendered"></div>
    <div id="chartdiv"></div>
    <Summary :tableData="summaryData" :dateFrom="start" :dateTo="end"></Summary>
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
import Summary from './EnergyAverageValueTable'

export default {
  components: {
    Summary
  },
  props: {},
  data() {
    return {
      chartRendered: false,
      chart: null,
      chartData: [],
      summaryData: [],
      start: null,
      end: null
    }
  },
  methods: {
    onZoomedEvent(event) {
      this.start = event.startDate
      this.end = event.endDate

      let filteredData = this.chartData.filter((item) => {
        return moment(item.date).isBetween(this.start, this.end)
      })

      this.summaryData = []

      Object.keys(filteredData[0]).forEach(ft => {

        if (ft !== 'date' && ft !== 'DEMAND_AND_NONSCHEDGEN' && ft !== 'RRP') {
          const totalPower = filteredData.reduce((a, b) => {
            return a + b[ft]
          }, 0)

          this.summaryData.push({
            id: ft,
            range: {
              totalPower,
              energy: totalPower/12000
            }
          })
        }
      })

      this.summaryData.reverse()

      console.log(this.summaryData)

      // summary object
      /**@argument
       * id: 
       * label: 
       * 
       * range: {
       *  dateFrom:
       *  dateTo:
       *  totalPower:
       *  energy:
       *  contribution:
       *  averageValue:
       * }
       * 
       * point: {
       *  date:
       *  power:
       *  conribution:
       *  price:
       * }
       * 
       */
    }
  },
  computed: {
    ...mapGetters({
       genData: 'getGenerationData',
       priceData: 'getPriceData'
    })
  },
  watch: {
    genData(newData) {
      this.chartData = generateChartData(newData)
      this.chart = makeChart(
        this.chartData, 
        generateFieldMappings(),
        generateStockGraphs(),
        generateChartScrollbarSettings(),
        this
      )
      this.chartRendered = true
    },
    priceData(newData) {
      if (this.chart) {
        this.chart.dataSets[0].dataProvider = generatePriceData(this.chartData, newData)
        this.chart.validateData()
      }
    }
  },
}

function makeChart(chartData, fieldMappings, stockGraphs, chartScrollbarSettings, context) {
  return AmCharts.makeChart('chartdiv', {
    type: 'stock',
    // mouseWheelScrollEnabled: true,
    mouseWheelZoomEnabled: true,
    categoryAxesSettings: {
      minPeriod: "5mm",
      startOnAxis: true,
      equalSpacing: true,
      groupToPeriods: ['5mm', '15mm']
    },
    chartCursorSettings: {
      pan: true,
      categoryBalloonColor: '#000',
      cursorColor: '#000',
    },
    dataSets: [
      {
        dataProvider: chartData,
        categoryField: 'date',
        fieldMappings
      }
    ],
    panels: [{
      title: 'Generation (MW)',
      percentHeight: 70,
      showCategoryAxis: false,
      listeners: [
        {
          event: 'zoomed',
          method: context.onZoomedEvent
        }
      ],
      valueAxes: [ {
        id: "v1",
        dashLength: 6,
        zeroGridAlpha: 0,
        stackType: "regular",
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
    }, 
    // {
    //   title: 'Price',
    //   percentHeight: 30,
    //   valueAxes: [ {
    //     id: 'v2',
    //     logarithmic: true,
    //     minimum: 300,
    //     maximum: 15000,
    //     strictMinMax: true,
    //     includeGuidesInMinMax: false,
    //     guides: [{ value: 300 }, { value: 1000 }, { value: 5000 }]
    //   } ],
    //   stockGraphs: [{
    //     id: 'p1',
    //     valueAxis: 'v2',
    //     valueField: 'RRP',
    //     type: 'step',
    //     lineAlpha: 0.5,
    //     lineColor: '#000',
    //     useDataSetColors: false
    //   }], stockLegend: {
    //     // valueTextRegular: ' ',
    //     // markerType: 'none'
    //   }
    // }, 
    {
      title: 'Price ($)',
      percentHeight: 30,
      valueAxes: [ {
        id: 'v3',
        logarithmic: false,
        dashLength: 6,
        zeroGridAlpha: 0,
        maximum: 300,
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
      stockGraphs: [{
        id: 'p2',
        valueAxis: 'v3',
        valueField: 'RRP',
        type: 'step',
        lineAlpha: 0.5,
        lineColor: '#000',
        useDataSetColors: false
      }], stockLegend: {
        valueTextRegular: ' ',
        markerType: 'none'
      }
    }],
    chartScrollbarSettings
  })
}
</script>

<style>
#chartdiv {
  width: 100%;
  height: 500px;
}
a[title='JavaScript charts'] {
  display: none !important;
}

</style>
