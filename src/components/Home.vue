<template>
<div>
  <transition name="fade">
    <ui-zoom-out-button v-if="isChartZoomed && !isFetching && !isExportPng" />
  </transition>

  <transition name="slide-fade">
    <div v-if="isFetching" class="loading">
      <ui-loader />
    </div>
  </transition>
  
  <transition name="slide-fade">
    <div class="columns is-desktop is-variable is-1" v-show="!isFetching && !error">
      <div class="column" :class="{ export: isExportPng }">
        <div id="export-container">
          <export-png-header v-if="isExportPng" />

          <div style="position:relative">
            <panel-button />
            <all-regions-chart :chartData="nemData" />
            <div v-if="isExportPng">
              <all-regions-summary v-if="showSummaryPanel" />
              <export-legend v-else />
            </div>
          </div>
          
          <export-png-footer v-if="isExportPng" :hideTopBorder="showSummaryPanel" />
        </div>
      </div>

      <div class="column is-narrow" v-show="!isExportPng">
        <all-regions-summary />
        <all-regions-extent v-if="recordsTable" />
      </div>
    </div>
  </transition>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import domtoimage from '@/lib/dom-to-image';
import FileSaver from 'file-saver';
import EventBus from '@/lib/event-bus';
import updateRouterStartEnd from '@/lib/app-router';
import { GraphDomains } from '@/domains/graphs';
import { findRange } from '@/domains/date-ranges';

import AllRegionsChart from './AllRegions/Chart';
import AllRegionsSummary from './AllRegions/Summary';
import AllRegionsExtent from './ui/Extent';
import ExportPngHeader from './Export/PngHeader';
import ExportPngFooter from './Export/PngFooter';
import PanelButton from './AllRegions/ShowHideButton';
import ExportLegend from './Export/Legend';
import UiZoomOutButton from './ui/ZoomOutButton';
import UiLoader from './ui/Loader';

export default {
  components: {
    AllRegionsChart,
    AllRegionsSummary,
    AllRegionsExtent,
    ExportPngHeader,
    ExportPngFooter,
    ExportLegend,
    UiZoomOutButton,
    PanelButton,
    UiLoader,
  },
  created() {
    this.$store.dispatch('setDomains', GraphDomains);
    this.fetch();
  },
  mounted() {
    EventBus.$on('download.png', this.downloadPng);
  },
  beforeDestroy() {
    EventBus.$off('download.png');
  },
  data() {
    return {
      selectedRange: null,
    };
  },
  computed: {
    ...mapGetters({
      nemData: 'nemData',
      isFetching: 'isFetching',
      isChartZoomed: 'isChartZoomed',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
      isExportPng: 'isExportPng',
      exportName: 'getExportName',
      showSummaryPanel: 'showSummaryPanel',
      visType: 'visType',
      currentRange: 'currentRange',
      error: 'error',
      recordsTable: 'recordsTable',
      externalData: 'externalData',
    }),
    records() {
      return this.$route.query.records;
    },
  },
  watch: {
    nemData(data) {
      const start = this.startDate;
      const end = this.endDate;

      if (!this.isChartZoomed) {
        updateRouterStartEnd(this.$router, start, end);
      }

      // Generate table data
      this.$store.dispatch('generateRangeSummary', {
        data,
        start,
        end,
      });
    },
    currentRange() {
      // when currentRange changes, refetch the data
      this.fetch();
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
    fetch() {
      const range = findRange(this.currentRange);
      const url = `${this.visType}${range.folder}/nem${range.extension}.json`;
      this.$store.dispatch('fetchNemData', url);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/variables.scss";

.loading {
  background-color: $background;
  margin-top: 1rem;
  padding-top: 2rem;
  position: absolute;
  left: 3rem;
  right: 3rem;
}

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