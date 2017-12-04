<template>
  <div class="generators-chart-wrapper">
    <div class="loader" v-if="!chartRendered"></div>

    <div style="display: flex">
      <div id="generators-vis" style="width: 70%"></div>
      <table style="width: 30%" v-if="chartRendered">
        <thead>
          <tr>
            <th colspan="2"></th>
            <!-- range info -->
            <th v-if="hidePoint" class="instant-values" colspan="2">
              {{formatDate(start)}} — {{formatDate(end)}}
            </th>
            <!-- point info -->
            <th v-if="!hidePoint" class="instant-values" colspan="2">{{formatDate(pointData.date)}}</th>
          </tr>
          <tr>
            <th></th>
            <th style="text-align: left">Generators</th>

            <!-- range info -->
            <th v-if="hidePoint" class="instant-values">Energy (GWh)</th>
            <th v-if="hidePoint">Power (MW)</th>
            <!-- <th>Contribution (%)</th> -->

            <!-- point info -->
            <th v-if="!hidePoint" class="instant-values">Power (MW)</th>
            <th v-if="!hidePoint"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in summaryData" :key="item.id" class="active">
            <td style="width: 20px;">
              <div class="colour-sq" v-bind:style="{ backgroundColor: item.colour }"></div>
            </td>
            <td style="text-align:left">{{item.id}}</td>

            <td v-if="hidePoint" class="instant-values">{{formatNumber(item.range.energy)}}</td>
            <td v-if="hidePoint">{{formatNumber(item.range.totalPower)}}</td>
            <!-- <td>{{formatNumber(item.range.totalPower)}}</td> -->

            <td v-if="!hidePoint" class="instant-values">
              {{formatNumber(pointData[item.id])}}</td>
            <td v-if="!hidePoint" style="width: 50px">{{formatNumber(pointData[item.id]/pointDataTotal*100)}}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    
  </div>
</template>

<script>
import numeral from "numeral";
import { mapGetters } from "vuex";
import * as moment from "moment";
import * as chroma from 'chroma-js'

import { FUEL_TECH } from "../utils/FuelTechConfig";

export default {
  components: {},
  props: {
    genData: Object
  },
  data() {
    return {
      chartRendered: false,
      chart: null,
      chartData: [],
      summaryData: [],
      dataKeys: [],
      pointData: {},
      pointDataTotal: {},
      hidePoint: true,
      start: null,
      end: null
    };
  },
  methods: {
    onZoom(event) {},
    rollOutGraph(event) {
      this.hidePoint = true
    },
    onCursorHover(event) {
      if (event.index !== undefined) {
        
        const data = event.target.categoryLineAxis.data[event.index]
        const dataContext = data.dataContext
        const pointData = {
          date: data.category,
        }
        let pointDataTotal = 0
        
        this.dataKeys.forEach(key => {
          pointData[key] = dataContext[`${key}Average`]
          pointDataTotal += pointData[key]
        })
        this.pointData = pointData
        this.pointDataTotal = pointDataTotal

        this.hidePoint = false
      }
    },
    formatDate(date) {
      return moment(date).format('lll')
    },
    formatNumber: function(number, precision) {
      let formatter = precision ? precision : '0,0'
      let formatted = (number === 0 || isNaN(number)) ? '-' : numeral(number).format(formatter)
      return formatted
    },
  },
  watch: {
    genData(newData) {
      this.dataKeys = Object.keys(newData)
      console.log(this.dataKeys.length)

      const colourFrom = FUEL_TECH[this.$route.params.ft].colour
      const colourTo = chroma(colourFrom).brighten(2.6)
      const colours = chroma.scale([colourFrom, colourTo]).colors(this.dataKeys.length)

      this.chartData = generateChartData(newData)
      this.summaryData = generateSummaryTable(this.chartData, this.dataKeys, colours)

      this.start = this.chartData[0].date
      this.end = this.chartData[this.chartData.length-1].date

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

function generateSummaryTable(data, keys, colours) {
  const summaryData = []
  const dataObj = data[0]

  keys.forEach((key, index) => {
    if (key !== 'date') {
      const totalPower = data.reduce((a, b) => {
        return a + b[key]
      }, 0)

      summaryData.push({
        id: key,
        colour: colours[index],
        range: {
          totalPower,
          energy: totalPower/12000,
        }
      })
    }
  })

  summaryData.reverse()

  return summaryData
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

  generators.forEach((generator, index) => {
    const colour = colours[index]

    graphs.push({
      id: `g${index}`,
      valueField: generator,
      type: 'line',
      fillAlphas: 0.8,
      lineAlpha: 0,
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
      showNextAvailable: true,
      
    },
    dataSets: [
      {
        dataProvider: chartData,
        categoryField: "date",
        fieldMappings
      }
    ],
    panelsSettings: {
      fontFamily: "helvetica"
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
          },
          {
            event: "rollOutGraph",
            method: context.rollOutGraph
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
          valueTextRegular: " ",
          markerType: "none"
        }
      }
    ],
    chartScrollbarSettings: {enabled: false}
  });
}
</script>

<style scoped>
#generators-vis {
  height: 350px;
}

table {
  font-size: 0.8rem;
  border-collapse: collapse;
  margin-top: 30px;

  .value {
    padding-left: 10px;
    width: 200px;
    text-align: right;
  }

  td, th {
    text-align: right;
    padding: 5px;
    border-bottom: 1px solid #999;
  }

  .colour-sq {
    width: 15px;
    height: 15px;
    background-color: #999;
  }

  tbody tr {
    cursor: pointer;
    opacity: 0.3;

    .value span {
      visibility: hidden;
    }

    &.active {
      opacity: 1;

      .value  span {
        visibility: visible;
      }
    }

    &:hover {
      background-color: #eee;
    }
  }

  tfoot {
    td {
      font-weight: bold;
      background-color: #eee;
    }
  }
}

.instant-values {
  border-left: 1px solid #999;
}
</style>
