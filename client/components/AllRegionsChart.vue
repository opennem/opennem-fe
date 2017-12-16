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

      <!-- <div class="">
        <p><strong>Gigawatt hours</strong>, abbreviated as GWh, is a unit of energy representing one billion (1 000 000 000) watt hours and is equivalent to one million kilowatt hours.</p>
      </div> -->
      <!-- <FTRegionVis></FTRegionVis> -->
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
} from "../utils/ChartHelpers";
import FtSummary from "./EnergyAverageValueTable";
import FTRegionVis from '../components/FuelTechRegionVis'
import { FUEL_TECH } from "../utils/FuelTechConfig";

export default {
  components: {
    FtSummary,
    FTRegionVis
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

      let filteredData = this.chartData.filter(item => {
        return moment(item.date).isBetween(this.start, this.end);
      });

      if (filteredData[0]) {
        const summaryData = [];

        Object.keys(filteredData[0]).forEach(ft => {
          if (
            ft !== "date" &&
            ft !== "DEMAND_AND_NONSCHEDGEN" &&
            ft !== "RRP"
          ) {
            const totalPower = filteredData.reduce((a, b) => {
              return a + b[ft];
            }, 0);
            const dataPrice = filteredData.map((d, i) => {
              const rrp = filteredData[i]["RRP"] ? filteredData[i]["RRP"] : 0;
              return d[ft] * rrp;
            });
            const averagePrice =
              dataPrice.reduce((a, b) => a + b, 0) / totalPower;

            summaryData.push({
              id: ft,
              range: {
                totalPower,
                energy: totalPower / 12000,
                averagePrice
              }
            });
          }
        });

        summaryData.reverse();
        this.summaryData = summaryData;
      }
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
      console.log(newData);
      this.chartData = newData;

      let firstObj = Object.assign({}, this.chartData[0]);
      const lastIndex = this.chartData.length - 1;
      const startDate = firstObj.date;
      const endDate = this.chartData[lastIndex].date;

      delete firstObj.date;
      const keys = Object.keys(firstObj);

      const config = makeConfig(
        newData,
        guides(startDate, endDate),
        fieldMappings(keys),
        stockGraphs(keys),
        this
      );
      config.panels[0].listeners = [
        {
          event: "zoomed",
          method: this.onZoom
        },
        {
          event: "changed",
          method: this.onCursorHover
        }
      ];
      this.chart = AmCharts.makeChart("ft-vis", config);
      this.chartRendered = true;
    }
  }
};

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
    height: 408px;
  }
  .vis {
    display: flex;
  }
  .datagrid {
    margin-left: 20px;
    min-width: 500px
  }
}
</style>
