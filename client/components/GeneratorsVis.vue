<template>
  <div class="chart-wrapper">
    <div class="loader" v-if="!chartRendered"></div>

    <div class="vis" v-show="chartRendered">
      <div class="chart">
        <div id="generators-vis"></div>
      </div>
      <div class="datagrid">
        <FtSummary
          class="ft-summary"
          :tableData="summaryData"
          :loadsData="[]"
          :pointData="pointData"
          :dateFrom="start"
          :dateTo="end"
          :showPrice="false"
          :hidePoint="hidePoint">
        </FtSummary>
      </div>
    </div>
  </div>
</template>

<script>
import * as moment from "moment";
import * as chroma from 'chroma-js'

import {
  chartConfig,
  fieldMappings,
  stockGraphs,
  guides
} from "../utils/ChartHelpers"
import { FUEL_TECH } from "../utils/FuelTechConfig";
import FtSummary from "./EnergyAverageValueTable";

import { guides as ChartGuides } from "../utils/ChartHelpers.js"

export default {
  components: {
    FtSummary
  },
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
      hidePoint: true,
      start: null,
      end: null,
      ft: this.$route.params.ft
    };
  },
  methods: {
    onZoom(event) {},
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
        this.pointData['pointTotal'] = pointDataTotal

        this.hidePoint = false
      } else {
        this.hidePoint = true
      }
    }
  },
  watch: {
    genData(newData) {
      this.dataKeys = Object.keys(newData)

      const colourFrom = FUEL_TECH[this.ft].colour
      const colourTo = chroma(colourFrom).brighten(2.6)
      const colours = chroma.scale([colourFrom, colourTo]).colors(this.dataKeys.length)

      this.chartData = generateChartData(newData)
      this.summaryData = generateSummaryTable(this.chartData, this.dataKeys, colours)

      this.start = this.chartData[0].date
      this.end = this.chartData[this.chartData.length-1].date

      if (this.chart) {
        this.chart.clear()
        this.chart = null
      }

      this.chart = makeChart(this.chartData, this.ft, this)
      this.chartRendered = true
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.clear()
      this.chart = null
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

function generateStockGraphs(generators, ft) {
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

function makeChart(data, ft, context) {
  let firstObj = Object.assign({}, data[0]);
  const lastIndex = data.length - 1;
  const startDate = firstObj.date;
  const endDate = data[lastIndex].date;

  delete firstObj.date;
  const keys = Object.keys(firstObj);

  const config = makeConfig(
    data,
    guides(startDate, endDate),
    fieldMappings(keys),
    generateStockGraphs(keys, ft),
    this
  );
  config.panels[0].listeners = [
    {
      event: "zoomed",
      method: context.onZoom
    },
    {
      event: "changed",
      method: context.onCursorHover
    }
  ];

  return AmCharts.makeChart("generators-vis", config);
}

function makeConfig(
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
        categoryField: "date",
        fieldMappings
      }
    ],
    panels: [
      {
        title: "Generation (MW)",
        showCategoryAxis: true,
        valueAxes: [
          {
            id: "v1",
            dashLength: 6,
            zeroGridAlpha: 0,
            stackType: "regular",
            minimum: 0,
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
        guides,
        stockLegend: { enabled: false }
      }
    ]
  });
}
</script>

<style scoped>
#generators-vis {
  height: 300px;
}
.vis {
  display: block;
}
.chart {
  width: 100%;
}
.datagrid {
  margin: 0;
  max-width: 500px
}

@media only screen and (min-width: 1200px) {
  #generators-vis {
    height: 442px;
  }
  .vis {
    display: flex;
  }
  .datagrid {
    margin-left: 10px;
    min-width: 500px
  }
}
</style>
