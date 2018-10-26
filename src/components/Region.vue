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
          <div style="position: relative;">
            <panel-buttons />
            <region-chart :chartData="nemData" />
            <div v-if="isExportPng"
              :class="{
                'price-on': showPricePanel,
                'price-off': !showPricePanel,
                'temperature-on': showTemperaturePanel,
                'temperature-off': !showTemperaturePanel,
                'summary-on': showSummaryPanel,
                'summary-off': !showSummaryPanel,
              }">
              <region-summary v-if="showSummaryPanel" :showTemperature="false" />
              <export-legend v-else />
            </div>
          </div>
          
          <export-png-footer v-if="isExportPng" :hideTopBorder="showSummaryPanel" />
        </div>
      </div>

      <div class="column is-narrow" v-show="!isExportPng">
        <region-summary />
        <region-temperature :showTemperatureRange="showTemperatureRange" />
        <region-extent :showTemperature="true" :showPrice="true" />
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
import { getRegionLabel } from '@/domains/regions';
import { findRange } from '@/domains/date-ranges';

import RegionChart from './Region/Chart';
import RegionSummary from './Region/Summary';
import RegionTemperature from './Region/Temperature';
import RegionExtent from './ui/Extent';
import ExportPngHeader from './Export/PngHeader';
import ExportPngFooter from './Export/PngFooter';
import PanelButtons from './Export/PanelShowHideButtons';
import ExportLegend from './Export/Legend';
import UiZoomOutButton from './ui/ZoomOutButton';
import UiLoader from './ui/Loader';

export default {
  components: {
    RegionChart,
    RegionSummary,
    RegionTemperature,
    RegionExtent,
    ExportPngHeader,
    ExportPngFooter,
    ExportLegend,
    UiZoomOutButton,
    PanelButtons,
    UiLoader,
  },
  created() {
    const regionId = this.$route.params.region;
    this.$store.dispatch('setDomains', GraphDomains);
    this.$store.dispatch('setExportRegion', getRegionLabel(regionId));
    this.fetch();
  },
  mounted() {
    EventBus.$on('download.png', this.downloadPng);
  },
  beforeDestroy() {
    EventBus.$off('download.png');
  },
  props: {
    region: String,
  },
  computed: {
    ...mapGetters({
      nemData: 'nemData',
      isFetching: 'isFetching',
      isChartZoomed: 'isChartZoomed',
      chartTypeTransition: 'chartTypeTransition',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
      isExportPng: 'isExportPng',
      exportName: 'getExportName',
      showPricePanel: 'showPricePanel',
      showTemperaturePanel: 'showTemperaturePanel',
      showSummaryPanel: 'showSummaryPanel',
      visType: 'visType',
      isPower: 'isPower',
      currentRange: 'currentRange',
      error: 'error',
      hasInterval: 'hasInterval',
      currentInterval: 'currentInterval',
      yearsWeeks: 'yearsWeeks',
    }),
    regionId() {
      return this.$route.params.region;
    },
    records() {
      return this.$route.query.records;
    },
    showTemperatureRange() {
      return !this.isPower;
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
    region() {
      this.fetch();
    },
    regionId(id) {
      this.$store.dispatch('setExportRegion', getRegionLabel(id));
    },
    currentRange() {
      this.fetch();
    },
    isExportPng(value) {
      if (!value) {
        this.$store.dispatch('resetPanels');
      }
    },
    chartTypeTransition() {
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
      const visType = this.chartTypeTransition ? this.visType : range.visType;
      const extension = this.chartTypeTransition ? this.yearsWeeks : range.extension;
      const interval = this.chartTypeTransition ? `/history/${this.currentInterval}` : range.folder;
      const prependUrl = `${visType}${interval}`;

      const urls = this.chartTypeTransition ?
        this.yearsWeeks.map(w => `${prependUrl}/${this.region}1${w}.json`) :
        [`${prependUrl}/${this.region}1${extension}.json`];

      this.$store.dispatch('setVisType', visType);
      this.$store.dispatch('fetchData', urls);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../node_modules/bulma/sass/utilities/mixins.sass";
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
  margin: 0.5rem auto;
  position: relative;

  .vis {
    margin: 0.5rem;
    height: 590px;

    &.one-panel {
      height: 300px;
    }

    &.two-panels {
      height: 450px;
    }

    &.four-panels {
      height: 450px;
    }
  }

  table {
    width: 100%;
  }

  div {
    &.summary-on {
      margin-top: -1.5rem;
    }
    &.summary-on.temperature-on {
      margin-top: -1rem;
    }
    &.summary-off.price-on.temperature-on {
      margin-top: -1.5rem;
    }
    &.summary-off.price-off.temperature-on {
      margin-top: -1.5rem;
    }
    &.summary-off.price-off.temperature-off {
      margin-top: -2rem;
    }
    &.summary-off.price-on.temperature-off {
      margin-top: -2rem;
    }
  }

  // Workaround for overlaying panels in export view
  /deep/ .amcharts-stock-panel-div-stockPanel2 {
    position: relative;
    top: -2px;

    @include desktop {
      top: 0;
    }
  }

  #export-container {
    padding: 1rem;
    background-color: $background;
    position: relative;
    border-radius: 5px;
    border: 1px solid #ddd;
    box-shadow: 0 0 50px #ddd;
    padding: 1rem 0.5rem;
  }
}

</style>