<template>
  <div class="chart-wrapper" v-bind:class="{ 'export-overlay': showExport }">
    <div class="loader" v-if="refreshing"></div>

    <div class="vis" v-show="!refreshing" v-bind:class="{ export: showExport }">
      <div style="width: 100%">
        <div class="buttons">
          <button class="button clear" v-show="!showExport" v-on:click="toggleExportOptions()" style="position: absolute; right: 3px; top: -5px; border: 0; ">
            <img src="/icons/share-icon.png" alt="" style="height: 15px;">
            Share
          </button>

          <button class="button clear" v-show="showExport" v-on:click="downloadPNG()">
            <img src="/icons/download-icon.png" alt="" style="height: 15px;">
            PNG
          </button>

          <button class="button clear" v-show="showExport" v-on:click="toggleExportOptions()" style="position: absolute; right: 0; border: 0; padding: 10px;">
            <img src="/icons/close-icon.png" alt="" style="height: 15px;">
          </button>
        </div>

        <div class="chart">
          <div id="export-container">
            <div class="export-annotations export-annotations-top" v-show="showExport">
              <h1 contenteditable="true" v-on:keyup="onKeyup">Title</h1>
              <p contenteditable="true">Description</p>
            </div>
            
            <div style="padding: 5px; font-size: 0.9em;"><small>Generation (MW)</small></div>
            <div id="ft-vis"></div>

            <div class="export-annotations export-annotations-bottom" v-show="showExport">
              <span>
                sources <strong>AEMO, OpenNEM</strong>
              </span>
              <span style="float: right; margin-top: -15px;">
                shared by <strong contenteditable="true">@chienleng</strong>  
              </span>
            </div>
          </div>
        </div>

        
      </div>

      <div class="datagrid" v-show="!showExport">
        <FtSummary
          class="ft-summary"
          :tableData="sourcesData"
          :loadsData="loadsData"
          :pointData="pointData"
          :dateFrom="start"
          :dateTo="end"
          :showPrice="false"
          :hidePoint="hidePoint">
        </FtSummary>
      </div>

      <!-- <div v-if="showExport" class="export-options">
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

        <button style="border: 1px solid #ccc; padding: 10px 20px" v-on:click="exportTest()">Export to PNG</button>
      </div> -->
    </div>
  </div>
</template>

<script>
import numeral from "numeral";
import * as moment from "moment";
import domtoimage from 'dom-to-image';
import FileSaver from 'file-saver';

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
      loadsData: [],
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
      this.loadsData = this.summaryData.loadsData
    },
    onCursorHover(event) {
      if (event.index !== undefined) {
        const data = event.target.categoryLineAxis.data[event.index];
        const dataContext = data.dataContext;
        const pointData = {
          date: data.category,
          rrp: dataContext["priceAverage"]
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
    toggleExportOptions() {
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
    },
    downloadPNG() {
      domtoimage.toBlob(document.getElementById('export-container'))
        .then(function(blob) {
          FileSaver.saveAs(blob, 'chart.png');
          this.showExport = false;
        })
    },
    onKeyup(e) {
      console.log(e.target.innerText);

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

  h1,
  strong {
    color: #CB573A;
    margin: 0;
  }

  p {
    font-weight: 600;
  }

  &.export-annotations-bottom {
    font-size: 0.8em;
    margin-top: 20px;

    span {
      display: block;
    }
  }
}
#export-container {
  transition: all 0.2s ease-in-out;
}
.chart-wrapper {
  position: relative;
  transition: all 0.2s ease-in-out;

  &.export-overlay {
    padding: 0;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999;
    background-color: rgba(255,255,255,0.9);
    overflow: auto;

    .buttons {
      text-align: center;
      max-width: 640px;
      margin: 10px auto;
    }

    #export-container {
      padding: 1em;
    }
  }
}
.buttons {
  position: relative;
}
button {
  padding: 6px 6px 5px;
  border-radius: 5px;
  border: 1px dashed #bbb;
  transition: all 0.2s ease-in-out;
  color: #CB573A;
  font-size: 0.85em;

  img {
    position: relative;
    top: 1px;
  }

  &:hover {
    border-style: solid;
    border-color: #999;
  }

  &.clear {
    background: none;

    &:hover {
      background-color: #fff;
    }
  }
}
.toggle-save-options {
  /* position: absolute; 
  right: 0; 
  top: 0;  */
}
#ft-vis {
  height: 300px;
}
.vis {
  display: block;
}
.chart {
  width: 100%;
  transition: all 0.2s ease-in-out;
}
.export {
  /* margin: -1em 0 0 -1em; */
  #ft-vis {
    height: 300px;
  }

  .chart {
    max-width: 550px;
    margin: 0 auto;

    #export-container {
      background: #ece9e6;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    
  }
  & > div {

  }
} 
.datagrid,
.export-options {
  margin: 0;
}

@media only screen and (min-width: 960px) {
  #ft-vis {
    height: 609px;
  }
  .vis {
    display: flex;
  }
  .datagrid {
    margin-left: 10px;
    margin-top: 28px;
    min-width: 500px
  }
  .export-overlay {
    padding: 50px;
  }
  .export-options {
    margin-left: 20px;
    min-width: 400px;
  }
  .export #ft-vis {
    height: 400px;
  }      
}
</style>
