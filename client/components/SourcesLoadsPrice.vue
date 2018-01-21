<template>
  <div class="chart-wrapper">
    <div class="vis">
      <div class="chart">
        <div style="padding: 5px; font-size: 0.9em;"><small>Generation (MW)</small></div>
        <div id="ft-vis"></div>
      </div>
      <div class="datagrid">
        <FtSummary
          :tableData="sourcesData"
          :loadsData="loadsData"
          :totalAveragePrice="totalAveragePrice"
          :pointData="pointData"
          :dateFrom="start"
          :dateTo="end"
          :showPrice="true"
          :hidePoint="hidePoint">
        </FtSummary>
      </div>
    </div>
  </div>
</template>

<style scoped>
#ft-vis {
  height: 400px;
}
.vis {
  display: block;
}
.chart {
  width: 100%;
}
.datagrid {
  margin: 0;
  max-width: 550px
}

@media only screen and (min-width: 1200px) {
  #ft-vis {
    height: 500px;
  }
  .vis {
    display: flex;
  }
  .datagrid {
    margin-left: 10px;
    margin-top: 28px;
    min-width: 550px
  }
}
</style>

<script>
import {
  chartConfig,
  fieldMappings,
  stockGraphs,
  guides
} from '../utils/ChartHelpers'
import {
  generateChartData,
  generateChartData2,
  generatePriceData,
  generateSummaryData
} from '../utils/DataHelpers'
import FtSummary from './EnergyAverageValueTable'
import { FUEL_TECH } from '../utils/FuelTechConfig'
import EventBus from '../utils/EventBus'

export default {
  components: {
    FtSummary
  },
  props: {
    genData: Array
  },
  data () {
    return {
      chart: null,
      chartData: [],
      summaryData: null,
      sourcesData: [],
      loadsData: [],
      totalAveragePrice: 0,
      pointData: {},
      start: null,
      end: null,
      hidePoint: true,
      region: this.$route.params.region
    }
  },
  mounted() {
    EventBus.$on('row-hover', (name) => {
      this.showHoverSeries(name)
    });
    EventBus.$on('row-out', (name) => {
      this.showAllSeries()
    });
  },
  methods: {
    showHoverSeries(name) {
      this.chart.panels[0].graphs.forEach((graph) => {
        if (graph.id === name) {
          graph.changeOpacity(1)
        } else {
          graph.changeOpacity(0.1)
        }
      })
    },
    showAllSeries() {
      this.chart.panels[0].graphs.forEach((graph) => {
        graph.changeOpacity(1)
      })
    },
    onZoom (event) {
      this.start = event.startDate
      this.end = event.endDate
      this.summaryData = generateSummaryData(
        this.chartData,
        event.startDate,
        event.endDate
      )

      this.loadsData = this.summaryData.loadsData
      this.sourcesData = this.summaryData.sourcesData
      this.totalAveragePrice = this.summaryData.totalAveragePrice
    },
    onCursorHover (event) {
      if (event.index !== undefined) {
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
        this.hidePoint = false
      } else {
        this.hidePoint = true
      }
    },
    updateChartProvider () {
      // if (this.chart) {
      //   this.chart.dataSets[0].dataProvider = generatePriceData(
      //     this.chartData,
      //     newData
      //   )
      //   this.chart.validateData()
      //
      //   this.summaryData = generateSummaryData(
      //     this.chartData,
      //     this.chartData[0].date,
      //     this.chartData[this.chartData.length - 1].date
      //   )
      // }
    }
  },

  watch: {
    genData (newData) {
      const keys = []
      this.chartData = generateChartData2(newData)

      Object.keys(FUEL_TECH).forEach(ftKey => {
        const find = newData.find(ft => ft.fuel_tech === ftKey)
        if (find) {
          keys.push(find.fuel_tech)
        }
      })

      console.log(keys)
      
      // this.chartData = generatePriceData(stackedData, newData)

      if (this.chart) {
        this.chart.clear()
        this.chart = null
      }
      this.chart = makeChart(this.chartData, keys, this)
    }
  },
  beforeDestroy () {
    EventBus.$off('row-hover')
    EventBus.$off('row-out')

    if (this.chart) {
      this.chart.clear()
      this.chart = null
    }
  }
}

function makeChart (data, keys, context) {
  const firstObj = Object.assign({}, data[0])
  const lastIndex = data.length - 1
  const startDate = firstObj.date
  const endDate = data[lastIndex].date

  // remove date and rrp to generate proper keys for chart obj
  delete firstObj.date
  delete firstObj.RRP

  const mappings = [{ fromField: 'RRP', toField: 'RRP' }, ...fieldMappings(keys)]

  const config = makeConfig(
    data,
    guides(startDate, endDate),
    mappings,
    stockGraphs(keys),
    this
  )
  config.panels[0].listeners = [
    {
      event: 'zoomed',
      method: context.onZoom
    },
    {
      event: 'changed',
      method: context.onCursorHover
    }
  ]

  return AmCharts.makeChart('ft-vis', config)
}
function makeConfig (
  chartData,
  guides,
  fieldMappings,
  stockGraphs,
  chartScrollbarSettings,
  context
) {
  return chartConfig({
    dataSets: [
      {
        dataProvider: chartData,
        categoryField: 'date',
        fieldMappings
      }
    ],
    panels: [
      {
        title: 'Generation (MW)',
        percentHeight: 70,
        showCategoryAxis: false,
        valueAxes: [
          {
            id: 'v1',
            dashLength: 6,
            zeroGridAlpha: 0,
            stackType: 'regular',
            guides: [
              {
                includeGuidesInMinMax: false,
                value: 0,
                dashLength: 0,
                lineColor: '#000',
                lineThickness: 1,
                lineAlpha: 1
              }
            ]
          }
        ],
        stockGraphs,
        guides,
        stockLegend: { enabled: false }
      },
      {
        title: 'Price ($)',
        percentHeight: 30,
        valueAxes: [
          {
            id: 'v3',
            logarithmic: false,
            dashLength: 6,
            zeroGridAlpha: 0,
            maximum: 300,
            minimum: 0,
            guides: [
              {
                includeGuidesInMinMax: false,
                value: 0,
                dashLength: 0,
                lineColor: '#000',
                lineThickness: 1,
                lineAlpha: 1
              }
            ]
          }
        ],
        stockGraphs: [
          {
            id: 'p2',
            valueAxis: 'v3',
            valueField: 'RRP',
            type: 'step',
            lineAlpha: 0.5,
            lineColor: '#000',
            useDataSetColors: false
          }
        ],
        guides,
        stockLegend: {
          valueTextRegular: ' ',
          markerType: 'none'
        }
      }
    ]
  })
}
</script>