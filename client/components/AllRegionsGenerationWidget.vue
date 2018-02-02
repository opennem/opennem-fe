<template>
  <div class="wrapper" style="padding: .5rem; border-top: 1px solid #C74523">
    <div class="loader" v-if="refreshing"></div>
    
    <div style="padding-bottom: 2px;" v-if="!refreshing">
      <a href="http://opennem.org.au" title="OpenNEM" target="_blank">
        <img class="opennem-logo" src="/images/logo.png" alt="OpenNEM">
      </a>
      <h4 style="margin: 0; display: inline-block; color: #C74523; position: relative; top: -8px;">National Electricity Market</h4>
    </div>
    
    <div>
      <div id="ft-vis"></div>
    </div>
    
    <div style="padding-top: 6px; font-size: 0.55em; color: #666; text-align: left; border-top: 1px solid #aaa; position: relative;" v-if="!refreshing">
      <!-- <a href="http://opennem.org.au" target="_blank">
        OpenNEM
      </a> -->
      <span style="font-size: 0.9em; position: relative; top: -3px; left: 3px">
        <a href="http://opennem.org.au" title="OpenNEM" target="_blank" style="">
          OpenNEM
        </a>
        is a project of the
        <a href="http://energy-transition-hub.org" target="_blank">
          Energy Transition Hub
        </a>
      </span>
    </div>

    <div style="position: absolute; bottom: 5px; right: 10px;">
      <a href="#" v-on:click.stop.prevent="toggleLegend()" style="font-size: 1em;">
        <i class="far fa-list-alt"></i>
      </a>
      <a href="http://opennem.org.au" title="OpenNEM" target="_blank" style="font-size: 1em;">
        <i class="fas fa-info-circle"></i>
      </a>
    </div>

    <transition name="slide-fade">
      <div class="export-legend" v-show="showLegend" style="position: absolute; top: 52px; right: 0; background: rgba(255,255,255,.95);">
        <div class="legend-graph" style="display: block; padding-left: 5px;" v-for="item in sourcesData" :key="item.id">
          <div class="colour-sq" v-bind:style="{backgroundColor: getColour(item.id, item.colour)}"></div>
          {{getLabel(item.id)}}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import numeral from "numeral";
import * as moment from "moment";
import domtoimage from '../utils/dom-to-image';
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

let _storedDisplayDate = null

export default {
  components: {
    FtSummary,
  },
  mounted() {
    // EventBus.$on('row-hover', (name) => {
    //   this.showHoverSeries(name)
    // });
    // EventBus.$on('row-out', (name) => {
    //   this.showAllSeries()
    // });
  },
  props: {
    genData: Array,
    refreshing: Boolean,
  },
  data() {
    return {
      chartRendered: false,
      chart: null,
      chartData: [],
      summaryData: {},
      tableData: [],
      sourcesData: [],
      loadsData: [],
      pointData: {},
      start: null,
      end: null,
      hidePoint: true,
      showLegend: false,
    };
  },
  methods: {
    getLabel(id) {
      const label = FUEL_TECH[id] ? FUEL_TECH[id].label : id;
      return label;
    },
    getColour(id, itemColour) {
      let colour = "#fff";
      if (itemColour !== undefined) {
        colour = itemColour;
      } else if (FUEL_TECH[id] !== undefined) {
        colour = FUEL_TECH[id].colour;
      }
      return colour;
    },
    toggleLegend() {
      if (this.showLegend) {
        this.showLegend = false;
      } else {
        this.showLegend = true;
      }
    },
    // showHoverSeries(name) {
    //   this.chart.panels[0].graphs.forEach((graph) => {
    //     if (graph.id === name) {
    //       graph.changeOpacity(1)
    //     } else {
    //       graph.changeOpacity(0.1)
    //     }
    //   })
    // },
    // showAllSeries() {
    //   this.chart.panels[0].graphs.forEach((graph) => {
    //     graph.changeOpacity(1)
    //   })
    // },
    onZoom(event) {
      this.start = event.startDate;
      this.end = event.endDate;

      this.summaryData = generateSummaryData(this.chartData, this.start, this.end)
      this.tableData= this.summaryData.allData
      this.sourcesData = this.summaryData.sourcesData
      this.loadsData = this.summaryData.loadsData
    },
    onCursorHover(event) {
      // if (event.index !== undefined) {
      //   const data = event.target.categoryLineAxis.data[event.index];
      //   const dataContext = data.dataContext;
      //   const pointData = {
      //     date: data.category
      //   };

      //   Object.keys(FUEL_TECH).forEach(ft => {
      //     pointData[ft] = dataContext[`${ft}Average`];
      //   });

      //   this.pointData = pointData;
      //   this.hidePoint = false;
      // } else {
      //   this.hidePoint = true;
      // }
    },
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

      console.log(this.chart.panels[0].categoryAxis)
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

function makeChart(data, context) {
  let firstObj = Object.assign({}, data[0]);
  const lastIndex = data.length - 1;
  const startDate = firstObj.date;
  const endDate = data[lastIndex].date;
  const chartGuides = guides(startDate, endDate)

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
        // categoryAxis: {
        //   labelFunction: function(valueText, date, categoryAxis) {
        //     const mDate = moment(date)
        //     let displayDate = ''

        //     if (!_storedDisplayDate || (mDate.dayOfYear() !== _storedDisplayDate.dayOfYear())) {
        //       _storedDisplayDate = moment(date)
        //       displayDate = _storedDisplayDate.format('DD MMM ')
        //     } 
        //     return ' ' + mDate.format('ha') + '\n ' + displayDate
        //   }
        // },
        allLabels: [
          {
            text: "Generation",
            bold: true,
            x: 5,
            y: 5
          },
          {
            text: "(GW)",
            x: 70,
            y: 7,
            color: '#999',
            size: 9
          }
        ],
        valueAxes: [
          {
            id: "v1",
            dashLength: 6,
            zeroGridAlpha: 0,
            gridAlpha: 0,
            stackType: "regular",
            minimum: 0,
            labelsEnabled: false,
            guides: [
              {
                includeGuidesInMinMax: false,
                value: 0,
                dashLength: 0,
                lineColor: "#000",
                lineThickness: 1,
                lineAlpha: 1
              },
              {
                includeGuidesInMinMax: false,
                value: 10000,
                label: '10',
                dashLength: 7,
                lineColor: "#bbb",
                lineThickness: 1,
                lineAlpha: 1
              },
              {
                includeGuidesInMinMax: false,
                value: 20000,
                label: '20',
                dashLength: 7,
                lineColor: "#bbb",
                lineThickness: 1,
                lineAlpha: 1
              },
              {
                includeGuidesInMinMax: false,
                value: 30000,
                label: '30',
                dashLength: 7,
                lineColor: "#bbb",
                lineThickness: 1,
                lineAlpha: 1
              },
              
            ]
          }
        ],
        stockGraphs,
        guides,
        stockLegend: { enabled: false }
      }
    ]
  }, true);
}

// function setOpacity(graph, opacity) {
//   var container = graph.chart.div;
//   var className = "amcharts-graph-" + graph.id;
//   var items = container.getElementsByClassName(className);
//   if (undefined === items)
//     return;
//   for (var x in items) {
//     if ("object" !== typeof items[x])
//       continue;
//     var path = items[x].getElementsByTagName("path")[0];
//     console.log(path)
//     if (undefined !== path) {
//       // set line opacity
//       path.style.strokeOpacity = opacity;
//       path.style.fillOpacity = opacity;
//     }

//     // set bullet opacity
//     var bullets = items[x].getElementsByClassName("amcharts-graph-bullet");
//     for (var y in bullets) {
//       if ("object" !== typeof bullets[y])
//         continue;
//       bullets[y].style.fillOpacity = opacity;
//     }

//     // set label opacity
//     var labels = items[x].getElementsByClassName("amcharts-graph-label");
//     for (var y in labels) {
//       if ("object" !== typeof labels[y])
//         continue;
//       labels[y].style.opacity = opacity == 1 ? 1 : 0;
//     }

//   }
// }
</script>

<style scoped>
.opennem-logo {
  height: 28px;
}
#ft-vis {
  width: 100%;
  height: 250px;
}

.wrapper {
  position: relative;

  .chart {
    width: 100%;
  }
}

.button {
  font-size: 0.75rem;
}

.export-legend {
  font-size: 0.65em;
  color: #000;
  padding-top: 5px;
  padding-bottom: 0;

  .legend-graph {
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 5px;
  }

  .colour-sq {
    width: 10px;
    height: 10px;
    background-color: #999;
    display: inline-block;
    margin-right: 5px;
  }

}

.button {
  padding: 5px 6px 2px;
  border-radius: 0;
  border: 1px solid #ccc;
  transition: all 0.2s ease-in-out;
  color: black;
  font-size: 0.6em;
  font-weight: 600;

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

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all .3s ease;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(10px);
  opacity: 0;
}

@media only screen and (min-width: 960px) {
  #ft-vis {
    /* width: 960px; */
    height: 300px;
  }
  .vis {
    /* display: flex; */
  }  
}
</style>
