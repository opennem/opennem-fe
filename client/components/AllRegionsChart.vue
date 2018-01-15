<template>
  <div class="chart-wrapper" style="position: relative">
    <button v-on:click="exportPng()" style="position: absolute; right: 0; top: -40px; border: 1px solid #ccc; padding: 10px 20px">export to png</button>

    <div class="loader" v-if="refreshing"></div>

    <div class="vis" v-show="!refreshing" v-bind:class="{ export: showExport }">
      <div class="chart">
        <div class="export-annotations export-annotations-top" v-show="showExport">
          <h1>Title</h1>
          <p>Some description</p>
        </div>
        
        <div id="ft-vis"></div>

        <div class="export-annotations export-annotations-bottom" v-show="showExport">
          <span>
            chart from: <a href="#">OpenNEM</a>
          </span>
          <span>
            source: <a href="#">AEMO</a>
          </span>
          <span>
            shared by: @chienleng
          </span>
        </div>
      </div>

      <div class="datagrid" v-show="!showExport">
        <FtSummary
          class="ft-summary"
          :tableData="sourcesData"
          :loadsData="[]"
          :pointData="pointData"
          :dateFrom="start"
          :dateTo="end"
          :showPrice="false"
          :hidePoint="hidePoint">
        </FtSummary>
      </div>

      <div v-if="showExport" class="export-options">
        <h3>Personalise the chart</h3>
        <div class="form-group">
          <label>Title</label>
          <input type="text" class="input" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea cols="30" rows="3" class="input"></textarea>
        </div>
        <div class="form-group">
          <label>By</label>
          <input type="text" class="input" placeholder="i.e. @mytwittername" />
        </div>

        <button style="border: 1px solid #ccc; padding: 10px 20px">Export to PNG</button>
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
import EventBus from '../utils/EventBus';


export default {
  components: {
    FtSummary,
  },
  mounted() {
    EventBus.$on('row-hover', (name) => {
      this.showHoverSeries(name)
    });
    EventBus.$on('row-out', (name) => {
      this.showAllSeries()
    });
  },
  props: {
    genData: Array,
    refreshing: Boolean,
    noGuides: Boolean,
    chartType: String,
    forceGridCount: Boolean
  },
  data() {
    return {
      chartRendered: false,
      chart: null,
      chartData: [],
      summaryData: {},
      sourcesData: [],
      pointData: {},
      start: null,
      end: null,
      hidePoint: true,
      showExport: false,
    };
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
    onZoom(event) {
      this.start = event.startDate;
      this.end = event.endDate;

      this.summaryData = generateSummaryData(this.chartData, this.start, this.end)
      this.sourcesData = this.summaryData.sourcesData
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
    },
    exportPng() {
      if (this.showExport) {
        this.showExport = false;
      } else {
        this.showExport = true;
      }
      // if (this.chart) {
      //   this.chart.export.capture( {}, function() {
      //     this.toPNG( {}, function( data ) {
      //       this.download(data, this.defaults.formats.PNG.mimeType, 'amCharts.png')
      //     } );
      //   })
      // }
    }
  },
  watch: {
    genData(newData) {
      this.chartData = newData;
      if (this.chart) {
        this.chart.clear()
        this.chart = null
      }
      this.chart = makeChart(this.chartData, this.noGuides, this)
      this.chartRendered = true;
    }
  },
  beforeDestroy() {
    EventBus.$off('row-hover')
    EventBus.$off('row-out')
    if (this.chart) {
      this.chart.clear()
      this.chart = null
    }
  }
};

function makeChart(data, noGuides, context) {
  let firstObj = Object.assign({}, data[0]);
  const lastIndex = data.length - 1;
  const startDate = firstObj.date;
  const endDate = data[lastIndex].date;
  const chartGuides = noGuides ? [] : guides(startDate, endDate)

  delete firstObj.date;
  const keys = Object.keys(firstObj);

  const config = makeConfig(
    data,
    chartGuides,
    fieldMappings(keys),
    stockGraphs(keys, context.chartType),
    context
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
        addClassNames: true,
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
  }, context.forceGridCount);
}

function setOpacity(graph, opacity) {
  var container = graph.chart.div;
  var className = "amcharts-graph-" + graph.id;
  var items = container.getElementsByClassName(className);
  if (undefined === items)
    return;
  for (var x in items) {
    if ("object" !== typeof items[x])
      continue;
    var path = items[x].getElementsByTagName("path")[0];
    console.log(path)
    if (undefined !== path) {
      // set line opacity
      path.style.strokeOpacity = opacity;
      path.style.fillOpacity = opacity;
    }

    // set bullet opacity
    var bullets = items[x].getElementsByClassName("amcharts-graph-bullet");
    for (var y in bullets) {
      if ("object" !== typeof bullets[y])
        continue;
      bullets[y].style.fillOpacity = opacity;
    }

    // set label opacity
    var labels = items[x].getElementsByClassName("amcharts-graph-label");
    for (var y in labels) {
      if ("object" !== typeof labels[y])
        continue;
      labels[y].style.opacity = opacity == 1 ? 1 : 0;
    }

  }
}
</script>

<style scoped>
.export-annotations {
  font-size: 0.8em;

  &.export-annotations-bottom {
    font-size: 0.8em;
    margin-top: 20px;

    span {
      display: block;
    }
  }
}
#ft-vis {
  height: 300px;
}
.vis {
  display: block;
}
.chart {
  width: 100%;
  transition: all 0.25s ease-out;
}
.export {
  /* margin: -1em 0 0 -1em; */
  .chart {
    width: 640px;
    background: #fff;
    border: 1px solid #ddd;


    #ft-vis {
      height: 480px;
    }
  }
  & > div {
    padding: 1em;
  }
} 
.datagrid,
.export-options {
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
  .export-options {
    margin-left: 20px;
    min-width: 400px;
  }
}
</style>
