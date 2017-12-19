<template>
  <div class="chart-wrapper">
    <div class="loader" v-if="refreshing"></div>

    <div class="vis" v-show="!refreshing">
      <div class="chart">
        <div id="ft-vis"></div>
      </div>
      <div class="datagrid">
        <FtSummary
          class="ft-summary"
          :tableData="summaryData"
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
import numeral from "numeral";
import * as moment from "moment";

import {
  chartConfig,
  fieldMappings,
  stockGraphs,
  guides
} from "../utils/ChartHelpers"
import { generateSummaryData } from '../utils/DataHelpers'
import FtSummary from "./EnergyAverageValueTable";
import { FUEL_TECH } from "../utils/FuelTechConfig";

export default {
  components: {
    FtSummary,
  },
  props: {
    genData: Array,
    refreshing: Boolean
  },
  data() {
    return {
      chartRendered: false,
      chart: null,
      chartData: [],
      summaryData: [],
      pointData: {},
      start: null,
      end: null,
      hidePoint: true
    };
  },
  methods: {
    onZoom(event) {
      this.start = event.startDate;
      this.end = event.endDate;

      this.summaryData = generateSummaryData(this.chartData, this.start, this.end)
    },
    onCursorHover(event) {
      if (event.index !== undefined) {
        const data = event.target.categoryLineAxis.data[event.index];
        const dataContext = data.dataContext;
        const pointData = {
          date: data.category,
          rrp: dataContext["RRPAverage"]
        };

        Object.keys(FUEL_TECH).forEach(ft => {
          pointData[ft] = dataContext[`${ft}Average`];
        });

        this.pointData = pointData;
        this.hidePoint = false;
      } else {
        this.hidePoint = true;
      }
    }
  },
  watch: {
    genData(newData) {
      this.chartData = newData;
      if (this.chart) {
        this.chart.clear()
        this.chart = null
      }
      this.chart = makeChart(this.chartData, this)
      this.chartRendered = true;
    }
  },
  beforeDestroy() {
    this.chart.clear()
    this.chart = null
  }
};

function makeChart(data, context) {
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
#ft-vis {
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
  #ft-vis {
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
