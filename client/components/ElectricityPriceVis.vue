<template>
  <div class="chart-wrapper">
    <div class="vis">
      <div class="chart">
        <div id="ft-vis"></div>
      </div>
      <div class="datagrid">
        <FtSummary
          :tableData="summaryData"
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

<script>
import * as moment from "moment"

import {
  chartConfig,
  fieldMappings,
  stockGraphs,
  guides
} from "../utils/ChartHelpers";
import {
  generateChartData,
  generatePriceData,
  generateSummaryData
} from '../utils/DataHelpers'
import FtSummary from "./EnergyAverageValueTable"
import { FUEL_TECH } from "../utils/FuelTechConfig"

export default {
  components: {
    FtSummary
  },
  props: {
    genData: Object,
    priceData: Object
  },
  data() {
    return {
      chart: null,
      chartData: [],
      summaryData: [],
      pointData: {},
      start: null,
      end: null,
      hidePoint: true,
      region: this.$route.params.region
    }
  },
  methods: {
    onZoom(event) {
      this.start = event.startDate
      this.end = event.endDate
      this.summaryData = generateSummaryData(
        this.chartData,
        event.startDate,
        event.endDate
      )
    },
    onCursorHover(event) {
      if (event.index !== undefined) {
        const data = event.target.categoryLineAxis.data[event.index]
        const dataContext = data.dataContext
        const pointData = {
          date: data.category,
          rrp: dataContext["RRPAverage"]
        }

        Object.keys(FUEL_TECH).forEach(ft => {
          pointData[ft] = dataContext[`${ft}Average`]
        })

        this.pointData = pointData
        this.hidePoint = false
      } else {
        this.hidePoint = true
      }
    }
  },

  watch: {
    genData(newData) {
      this.chartData = generateChartData(newData)
      this.chart = makeChart(this.chartData, this)
    },
    priceData(newData) {
      if (this.chart) {
        this.chart.dataSets[0].dataProvider = generatePriceData(
          this.chartData,
          newData
        )
        this.chart.validateData()

        this.summaryData = generateSummaryData(
          this.chartData,
          this.chartData[0].date,
          this.chartData[this.chartData.length - 1].date
        )
      }
    }
  }
}

function makeChart(data, context) {
  let firstObj = Object.assign({}, data[0]);
  const lastIndex = data.length - 1;
  const startDate = firstObj.date;
  const endDate = data[lastIndex].date;

  delete firstObj.date;
  const keys = Object.keys(firstObj);
  const mappings = [{fromField: 'RRP', toField: 'RRP'}, ...fieldMappings(keys)]

  const config = makeConfig(
    data,
    guides(startDate, endDate),
    mappings,
    stockGraphs(keys),
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

  return AmCharts.makeChart("ft-vis", config);
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
        percentHeight: 70,
        showCategoryAxis: false,
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
        guides,
        stockLegend: { enabled: false }
      },
      {
        title: "Price ($)",
        percentHeight: 30,
        valueAxes: [
          {
            id: "v3",
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
                lineColor: "#000",
                lineThickness: 1,
                lineAlpha: 1
              }
            ]
          }
        ],
        stockGraphs: [
          {
            id: "p2",
            valueAxis: "v3",
            valueField: "RRP",
            type: "step",
            lineAlpha: 0.5,
            lineColor: "#000",
            useDataSetColors: false
          }
        ],
        guides,
        stockLegend: {
          valueTextRegular: " ",
          markerType: "none"
        }
      }
    ]
  });
}
</script>

<style>
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
    margin-left: 20px;
    min-width: 550px
  }
}
</style>
