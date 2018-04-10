<template>
<div class="columns is-desktop is-variable is-1">
  <div class="zoom-out-btn">
    <transition name="fade">
      <button class="button is-small is-rounded is-primary is-inverted" 
        @click="handleZoomOutClicked" 
        v-if="isChartZoomed && !isFetching">Reset Zoom</button>
    </transition>
  </div>

  <div class="column" v-show="!isFetching" :class="{ export: isExportPng }">
    <div id="export-container">
      <export-png-header v-if="isExportPng" />
      <all-regions-chart :chartData="chartData" />
      <export-legend v-if="isExportPng" />
      <export-png-footer v-if="isExportPng" />
    </div>
  </div>
  <div class="column is-narrow" v-if="!isFetching && !isExportPng">
    <all-regions-summary />

    <!-- <table class="summary-table table is-fullwidth is-narrow">
      <thead>
        <tr>
          <th></th>
          <th class="has-text-right">Lowest</th>
          <th class="has-text-right">Highest</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Demand MW</td>
          <td class="cell-value">
            <span>17,115</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
          <td class="cell-value">
            <span>17,115</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
        </tr>
        
        <tr>
          <td>Renewables %</td>
          <td class="cell-value">
            <span>11%</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
          <td class="cell-value">
            <span>31%</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
        </tr>

        <tr>
          <td>Price $/MWh</td>
          <td class="cell-value">
            <span>$10</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
          <td class="cell-value">
            <span>$300</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
        </tr>

        <tr>
          <td>Temperature</td>
          <td class="cell-value">
            <span>10C</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
          <td class="cell-value">
            <span>30C</span>
            <span class="date-value">25 Mar, 4:50am</span>
          </td>
        </tr>
      </tbody>
    </table> -->
  </div>
</div>

</template>

<script>
import { mapGetters } from 'vuex';
import domtoimage from '@/lib/dom-to-image';
import FileSaver from 'file-saver';
import EventBus from '@/lib/event-bus';
import getJSON from '@/lib/data-apis';
import dataTransform from '@/lib/data-transform';
import { getStartEndDates } from '@/lib/data-helpers';
import { GraphDomains } from '@/domains/graphs';
import AllRegionsChart from './AllRegions/Chart';
import AllRegionsSummary from './AllRegions/Summary';
import ExportPngHeader from './Export/PngHeader';
import ExportPngFooter from './Export/PngFooter';
import ExportLegend from './Export/Legend';

export default {
  components: {
    AllRegionsChart,
    AllRegionsSummary,
    ExportPngHeader,
    ExportPngFooter,
    ExportLegend,
  },
  created() {
    this.$store.dispatch('setDomains', GraphDomains);
    this.fetchNem();
  },
  mounted() {
    EventBus.$on('data.fetch.latest', this.fetchNem);
    EventBus.$on('download.vis.clicked', this.downloadPNG);
  },
  beforeDestroy() {
    EventBus.$off('data.fetch.latest');
    EventBus.$off('download.vis.clicked');
  },
  data() {
    return {
      chartData: [],
    };
  },
  computed: {
    ...mapGetters({
      isFetching: 'isFetching',
      isChartZoomed: 'isChartZoomed',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
      isExportPng: 'isExportPng',
      exportName: 'getExportName',
    }),
  },
  watch: {
    chartData(data) {
      let start = this.startDate;
      let end = this.endDate;

      if (!this.isChartZoomed) {
        const startEndDates = getStartEndDates(data);
        start = startEndDates.start;
        end = startEndDates.end;
        this.$store.dispatch('saveSelectedDates', startEndDates);
      }

      // Generate table data
      this.$store.dispatch('generateRangeSummary', {
        data,
        start,
        end,
      });
    },
  },
  methods: {
    handleZoomOutClicked() {
      EventBus.$emit('chart.zoomedOut.clicked');
    },
    downloadPNG() {
      domtoimage.toBlob(document.getElementById('export-container'))
        .then((blob) => {
          FileSaver.saveAs(blob, `${this.exportName}.png`);
          this.$store.dispatch('setExportPng', false);
        });
    },
    fetchNem() {
      this.$store.dispatch('fetchingData', true);

      const url = 'data/power/nem.json';

      getJSON(url).then((response) => {
        const transformedData = dataTransform(GraphDomains, response.data);
        this.chartData = transformedData;
        this.$store.dispatch('setDataEndDate', transformedData[transformedData.length - 1].date);
        this.$store.dispatch('fetchingData', false);
        this.$store.dispatch('setExportData', transformedData);
        this.$store.dispatch('setExportRegion', 'OpenNEM');
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/variables.scss";

.export {
  max-width: 650px;
  border-radius: 5px;
  border: 1px solid #ddd;
  box-shadow: 0 0 50px #ddd;
  padding: 1rem 0;
  margin: 1rem auto;

  .vis {
    margin: 0.5rem;
    height: 300px;
  }

  #export-container {
    padding: 1rem;
    background-color: $background;
  }
}
.zoom-out-btn {
  position: absolute;
  z-index: 9;
  right: 0;
  left: 0;
  width: 94px;
  margin: -2px auto 0;
}
</style>