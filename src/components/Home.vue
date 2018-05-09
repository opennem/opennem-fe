<template>
<div class="columns is-desktop is-variable is-1">
  <transition name="fade">
    <zoom-out-button v-if="isChartZoomed && !isFetching  && !isExportPng" />
  </transition>

  <div class="column" v-show="!isFetching" :class="{ export: isExportPng }">
    <div id="export-container">
      <export-png-header v-if="isExportPng" />

      <div style="position:relative">
        <panel-button />
        <all-regions-chart :chartData="chartData" />
        <!-- <export-legend v-if="isExportPng" /> -->
        <div v-if="isExportPng">
          <all-regions-summary v-if="showSummaryPanel" />
          <export-legend v-else />
        </div>
      </div>
      
      <export-png-footer v-if="isExportPng" :hideTopBorder="showSummaryPanel" />
    </div>
  </div>
  <div class="column is-narrow" v-if="!isFetching && !isExportPng">
    <all-regions-summary />
    <all-regions-extent v-if="records" />
  </div>
</div>

</template>

<script>
import { mapGetters } from 'vuex';
import domtoimage from '@/lib/dom-to-image';
import FileSaver from 'file-saver';
import EventBus from '@/lib/event-bus';
import getJSON from '@/lib/data-apis';
import updateRouterStartEnd from '@/lib/app-router';
import dataTransform from '@/lib/data-transform';
import { getStartEndDates } from '@/lib/data-helpers';
import { GraphDomains } from '@/domains/graphs';
import AllRegionsChart from './AllRegions/Chart';
import AllRegionsSummary from './AllRegions/Summary';
import AllRegionsExtent from './ui/Extent';
import ExportPngHeader from './Export/PngHeader';
import ExportPngFooter from './Export/PngFooter';
import PanelButton from './AllRegions/ShowHideButton';
import ExportLegend from './Export/Legend';
import ZoomOutButton from './ui/ZoomOutButton';

export default {
  components: {
    AllRegionsChart,
    AllRegionsSummary,
    AllRegionsExtent,
    ExportPngHeader,
    ExportPngFooter,
    ExportLegend,
    ZoomOutButton,
    PanelButton,
  },
  created() {
    this.$store.dispatch('setDomains', GraphDomains);
    this.fetchNem();
  },
  mounted() {
    EventBus.$on('data.fetch.latest', this.fetchNem);
    EventBus.$on('data.fetch.latest.30.days', this.fetchNem);
    EventBus.$on('download.png', this.downloadPng);
  },
  beforeDestroy() {
    EventBus.$off('data.fetch.latest');
    EventBus.$off('data.fetch.latest.30.days');
    EventBus.$off('download.png');
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
      showSummaryPanel: 'showSummaryPanel',
      visType: 'visType',
    }),
    records() {
      return this.$route.query.records;
    },
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
        updateRouterStartEnd(this.$router, start, end);
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
    downloadPng() {
      // a slight delay to allow some conditional statements to flow through by other listeners
      setTimeout(() => {
        domtoimage.toBlob(document.getElementById('export-container'))
          .then((blob) => {
            FileSaver.saveAs(blob, `${this.exportName}.png`);
          });
      }, 5);
    },
    fetchNem() {
      this.$store.dispatch('fetchingData', true);

      const url = `data/${this.visType}/nem.json`;

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
  margin: 1rem auto;

  .vis {
    margin: 0.5rem;
    height: 300px;
  }

  table {
    width: 100%;
  }

  #export-container {
    padding: 1rem;
    background-color: $background;
    border-radius: 5px;
    border: 1px solid #ddd;
    box-shadow: 0 0 50px #ddd;
    padding: 1rem 0.5rem;
  }
}

</style>