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

import { generateChartData, generatePriceData } from '../utils/AmchartsDataTransform'
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
      this.chart = makeChart(this.chartData, this)
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

function makeChart(chartData, context) {
  return AmCharts.makeChart('chartdiv', {
    type: 'stock',
    // mouseWheelScrollEnabled: true,
    mouseWheelZoomEnabled: true,
    categoryAxesSettings: {
      minPeriod: "5mm",
      startOnAxis: true,
      equalSpacing: true,
      groupToPeriods: ['5mm', 'hh']
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
        fieldMappings: [{
          fromField: 'wind',
          toField: 'wind'
        },{
          fromField: 'gas_steam',
          toField: 'gas_steam'
        },{
          fromField: 'gas_ccgt',
          toField: 'gas_ccgt'
        },{
          fromField: 'gas_ocgt',
          toField: 'gas_ocgt'
        },{
          fromField: 'distillate',
          toField: 'distillate'
        },{
          fromField: 'rooftop_solar',
          toField: 'rooftop_solar'
        }, {
          fromField: 'gas_steam',
          toField: 'gas_steam'
        }, {
          fromField: 'hydro',
          toField: 'hydro'
        }, {
          fromField: 'solar',
          toField: 'solar'
        }, {
          fromField: 'brown_coal',
          toField: 'brown_coal'
        }, {
          fromField: 'black_coal',
          toField: 'black_coal'
        }, {
          fromField: 'biomass',
          toField: 'biomass'
        }, {
          fromField: 'pumps',
          toField: 'pump'
        }, {
          fromField: 'gas_recip',
          toField: 'gas_recip'
        }, {
          fromField: 'NETINTERCHANGE',
          toField: 'NETINTERCHANGE'
        }, {
          fromField: 'RRP',
          toField: 'RRP'
        }]
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
        dashLength: 5,
        stackType: "regular"
      } ],
      stockGraphs: [
      {
        id: 'g1',
        valueField: 'NETINTERCHANGE',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0,
        negativeFillColors: '#44146F',
        lineAlpha: 0,
        lineColor: '#44146F',
        useDataSetColors: false
      },
      {
        id: 'g10',
        valueField: 'black_coal',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#000',
        lineAlpha: 0,
        lineColor: '#000',
        useDataSetColors: false
      },
      {
        id: 'g9',
        valueField: 'brown_coal',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#8B572A',
        lineAlpha: 0,
        lineColor: '#8B572A',
        useDataSetColors: false
      },
      {
        id: 'g12',
        valueField: 'biomass',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#A3886F',
        lineAlpha: 0,
        lineColor: '#A3886F',
        useDataSetColors: false
      },
      {
        id: 'g13',
        valueField: 'pumps',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#4A90E2',
        lineAlpha: 0,
        lineColor: '#4A90E2',
        useDataSetColors: false
      },
      {
        id: 'g8',
        valueField: 'hydro',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: 'steelblue',
        lineAlpha: 0,
        lineColor: 'steelblue',
        useDataSetColors: false
      },
      {
        id: 'g2',
        valueField: 'gas_steam',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#F48E1B',
        lineAlpha: 0,
        lineColor: '#F48E1B',
        useDataSetColors: false
      }, {
        id: 'g3',
        valueField: 'gas_ccgt',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#FDB462',
        lineAlpha: 0,
        lineColor: '#FDB462',
        useDataSetColors: false
      }, {
        id: 'g4',
        valueField: 'gas_ocgt',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#FFCD96',
        lineAlpha: 0,
        lineColor: '#FFCD96',
        useDataSetColors: false
      }, {
        id: 'g14',
        valueField: 'gas_recip',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#F9DCBC',
        lineAlpha: 0,
        lineColor: '#F9DCBC',
        useDataSetColors: false
      },
      {
        id: 'g5',
        valueField: 'wind',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#417505',
        lineAlpha: 0,
        lineColor: '#417505',
        useDataSetColors: false
      }, {
        id: 'g6',
        valueField: 'distillate',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#F35020',
        lineAlpha: 0,
        lineColor: '#F35020',
        useDataSetColors: false
      }, {
        id: 'g7',
        valueField: 'rooftop_solar',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#DFCF00',
        lineAlpha: 0,
        lineColor: '#DFCF00',
        useDataSetColors: false
      }, {
        id: 'g11',
        valueField: 'solar',
        type: 'line',
        fillAlphas: 0.8,
        negativeFillAlphas: 0.8,
        negativeFillColors: '#F8E71C',
        lineAlpha: 0,
        lineColor: '#F8E71C',
        useDataSetColors: false
      }],
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
        dashLength: 5,
        maximum: 300,
        minimum: 0
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
    chartScrollbarSettings: {
      graph: 'g7',
      usePeriod: 'hh',
      position: 'top',
      color: '#000',
      graphFillAlpha: 0,
      graphLineAlpha: 0,
      selectedGraphFillAlpha: 0,
      selectedGraphLineAlpha: 0,
      backgroundColor: '#eee',
      backgroundAlpha: 0.1,
      selectedBackgroundAlpha: 0.2,
      selectedBackgroundColor: 'steelblue',
      dragIcon: 'dragIconRectSmallBlack',
      dragIconHeight: 24,
      dragIconWidth: 24,
      scrollbarHeight: 50
    }
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
