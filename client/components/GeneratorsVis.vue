<template>
  <div class="generators-chart-wrapper">
    <div class="loader" v-if="!chartRendered"></div>
    <div id="generators-vis"></div>
    <!-- <FtSummary :tableData="summaryData" :pointData="pointData" :dateFrom="start" :dateTo="end" :showPrice="false"></FtSummary> -->
  </div>
</template>

<script>
import numeral from "numeral";
import { mapGetters } from "vuex";
import * as moment from "moment";
import * as chroma from 'chroma-js'

// import FtSummary from './EnergyAverageValueTable'
import { FUEL_TECH } from "../utils/FuelTechConfig";

export default {
  components: {},
  props: {},
  data() {
    return {
      chartRendered: false,
      chart: null,
      chartData: []
      // summaryData: [],
      // pointData: {},
      // start: null,
      // end: null
    };
  },
  methods: {
    onZoom(event) {
      // this.start = event.startDate
      // this.end = event.endDate
      // let filteredData = this.chartData.filter((item) => {
      //   return moment(item.date).isBetween(this.start, this.end)
      // })
      // if (filteredData[0]) {
      //   const summaryData = []
      //   Object.keys(filteredData[0]).forEach(ft => {
      //     if (ft !== 'date' && ft !== 'DEMAND_AND_NONSCHEDGEN' && ft !== 'RRP') {
      //       const totalPower = filteredData.reduce((a, b) => {
      //         return a + b[ft]
      //       }, 0)
      //       const dataPrice = filteredData.map((d, i) => {
      //         const rrp = filteredData[i]['RRP'] ? filteredData[i]['RRP'] : 0
      //         return d[ft] * rrp
      //       })
      //       const averagePrice = dataPrice.reduce((a, b) => a + b, 0) / totalPower
      //       summaryData.push({
      //         id: ft,
      //         range: {
      //           totalPower,
      //           energy: totalPower/12000,
      //           averagePrice
      //         }
      //       })
      //     }
      //   })
      //   summaryData.reverse()
      //   this.summaryData = summaryData
      // }
    },
    onCursorHover(event) {
      // if (typeof event.index !== 'undefined') {
      //   const data = event.target.categoryLineAxis.data[event.index]
      //   const dataContext = data.dataContext
      //   const pointData = {
      //     date: data.category,
      //     rrp: dataContext['RRPAverage']
      //   }
      //   Object.keys(FUEL_TECH).forEach(ft => {
      //     pointData[ft] = dataContext[`${ft}Average`]
      //   })
      //   this.pointData = pointData
      // }
    }
  },
  computed: {
    ...mapGetters({
      generatorsData: "getRegionFtByGeneratorsData"
    })
  },
  watch: {
    generatorsData(newData) {
      this.chartData = generateChartData(newData)

      this.chart = makeChart(
        this.chartData,
        generateFieldMappings(newData),
        generateStockGraphs(newData, this.$route.params.ft),
        this
      )
      this.chartRendered = true
    }
  }
}

function generateChartData(data) {
  const chartData = []

  Object.keys(data).forEach((generator, index) => {
    let g = data[generator]
    let startDate = g.start
    let interval = 5 // ft.interval
    let gData = g.data
    let hasChartData = chartData.length ? true : false

    const start = moment(startDate, moment.ISO_8601)

    for (let i = 0; i < gData.length; i++) {
      const now = moment(start).add(interval * i, "m")
      const d = gData[i]

      if (!hasChartData) {
        chartData[i] = {
          date: now.toDate()
        }
      }
      chartData[i][generator] = d
    }
  })

  return chartData
}

function generateFieldMappings(data) {
  const mappings = [];

  Object.keys(data).forEach(generator => {
    mappings.push({
      fromField: generator,
      toField: generator
    });
  });

  return mappings;
}

function generateStockGraphs(data, ft) {
  const generators = Object.keys(data)
  const graphs = []
  const colourFrom = FUEL_TECH[ft].colour
  const colourTo = chroma(colourFrom).brighten(2.6)
  const colours = chroma.scale([colourFrom, colourTo]).colors(generators.length)

  console.log(colours)
  generators.forEach((generator, index) => {
    const colour = colours[index]

    graphs.push({
      id: `g${index}`,
      valueField: generator,
      type: 'line',
      fillAlphas: 0.8,
      lineAlpha: 1,
      lineColor: colour,
      useDataSetColors: false,
    });
  });

  return graphs;
}

function makeChart(chartData, fieldMappings, stockGraphs, context) {
  return AmCharts.makeChart("generators-vis", {
    type: "stock",
    // mouseWheelScrollEnabled: true,
    mouseWheelZoomEnabled: true,
    categoryAxesSettings: {
      minPeriod: "5mm",
      startOnAxis: true,
      equalSpacing: true,
      groupToPeriods: ["5mm", "15mm", "30mm", "hh"]
    },
    chartCursorSettings: {
      pan: true,
      categoryBalloonColor: "#000",
      cursorColor: "#000",
      showNextAvailable: true
    },
    dataSets: [
      {
        dataProvider: chartData,
        categoryField: "date",
        fieldMappings
      }
    ],
    panelsSettings: {
      fontFamily: "Merriweather"
    },
    panels: [
      {
        title: "Generation (MW)",
        showCategoryAxis: false,
        listeners: [
          {
            event: "zoomed",
            method: context.onZoom
          },
          {
            event: "changed",
            method: context.onCursorHover
          }
        ],
        valueAxes: [
          {
            id: "v1",
            dashLength: 6,
            zeroGridAlpha: 0,
            stackType: "regular",
            guides: [
              {
                includeGuidesInMinMax: false,
                value: 0,
                dashLength: 0,
                lineColor: "#000",
                lineThickness: 1,
                lineAlpha: 1
              }
            ]
          }
        ],
        stockGraphs,
        stockLegend: {
          // valueTextRegular: " ",
          // markerType: "none"
        }
      }
    ],
    chartScrollbarSettings: {enabled: false}
  });
}
</script>

<style scoped>
#generators-vis {
  width: 100%;
  height: 350px;
}
</style>
