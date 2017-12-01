<template>
  <div class="fuel-tech-chart-wrapper">
    <div class="loader" v-if="!chartRendered"></div>
    <div id="ft-vis"></div>
    <FtSummary :tableData="summaryData" :pointData="pointData" :dateFrom="start" :dateTo="end" :showPrice="true"></FtSummary>
  </div>
</template>

<script>
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
    genData: {},
    priceData: {}
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
      fontFamily: 'Merriweather',
    },
    panels: [{
      title: 'Generation (MW)',
      percentHeight: 70,
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
#ft-vis {
  width: 100%;
  height: 600px;
}

</style>
