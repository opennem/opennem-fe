<template>
<div>
  <transition name="slide-fade">
    <div v-if="isFetching" class="loading">
      <ui-loader />
    </div>
  </transition>

  <div>
    <range-selector class="range-selector-container" v-if="!isExportPng" />
  </div>
  
  <transition name="slide-fade">
    <div class="columns is-desktop is-variable is-1" v-show="!isFetching">
      <div class="column" :class="{ export: isExportPng }">
        <div id="export-container">
          <export-png-header v-if="isExportPng" />

          <div style="position: relative;">
            <transition name="fade">
              <ui-zoom-out-button v-if="isChartZoomed && !isFetching && !isExportPng" />
            </transition>

            <panel-buttons />
            <region-chart :chartData="groupedNemData" :nemData="nemData" :customDomains="customDomains" v-show="!error" />
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

      <div class="column is-narrow" v-show="!isExportPng && !error">
        <region-summary class="region-summary" :region="region" />
        <region-temperature :showTemperatureRange="showTemperatureRange" />
        <region-extent v-if="isPower" :showTemperature="true" :showPrice="true" />
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
import RangeSelector from './ui/RangeSelector';

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
    RangeSelector,
  },
  created() {
    const regionId = this.$route.params.region;
    this.$store.dispatch('setDomains', GraphDomains);
    this.$store.dispatch('setExportRegion', getRegionLabel(regionId));
    this.$store.dispatch('region', `${regionId}1`);
    this.fetch();
  },
  mounted() {
    EventBus.$on('data.fetch', this.fetch);
    EventBus.$on('download.png', this.downloadPng);
  },
  beforeDestroy() {
    EventBus.$off('data.fetch');
    EventBus.$off('download.png');
  },
  props: {
    region: String,
  },
  computed: {
    ...mapGetters({
      nemData: 'nemData',
      groupedNemData: 'groupedNemData',
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
      nemUrls: 'nemUrls',
      groupSelected: 'groupSelected',
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
    customDomains() {
      const domains = {};
      this.groupSelected.groups.forEach((g) => {
        domains[g.id] = {
          colour: g.colour,
          type: g.type,
          label: g.label,
        };
      });

      this.$store.dispatch('domainGroups', domains);

      return domains;
    },
  },
  watch: {
    nemData(data) {
      const start = this.startDate;
      const end = this.endDate;

      if (!this.isChartZoomed) {
        updateRouterStartEnd(this.$router, start, end);
      }

      this.$store.dispatch('generateGroupedNemData');
      this.$store.dispatch('useGroups', true);

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
    groupSelected() {
      this.$store.dispatch('generateGroupedNemData');
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
      const periodFolder = this.currentInterval ?
        range.periodFolders[this.currentInterval] : range.folder;
      const visType = this.chartTypeTransition ? this.visType : range.visType;
      const extension = this.chartTypeTransition ? this.yearsWeeks : range.extension;
      const interval = this.chartTypeTransition ? `/history/${this.currentInterval}` : periodFolder;
      const prependUrl = `${visType}${interval}`;

      let urls = this.chartTypeTransition ?
        this.yearsWeeks.map(w => `${prependUrl}/${this.region}1${w}.json`) :
        [`${prependUrl}/${this.region}1${extension}.json`];

      if (this.nemUrls.length > 0) {
        const newUrls = this.nemUrls.map((u) => {
          if (u.indexOf('testing') === 0) {
            const slashIndices = [];
            for (var i = 0; i < u.length; i++) { // eslint-disable-line
              if (u.charAt(i) === '/') {
                slashIndices.push(i);
              }
            }

            const replaceState = u.substring(slashIndices[0] + 1, slashIndices[1]);
            return u.replace(replaceState, `${this.regionId}1`);
          }
          return u;
        });

        urls = newUrls;
      }

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
  margin-top: 1rem;
  padding-top: 2rem;
  position: absolute;
  left: 3rem;
  right: 3rem;

  @include mobile {
    margin-top: 3rem;
  }
}

.range-selector-container {
  padding: 0.3rem 0;
  margin-bottom: 1rem;
}

.region-summary {
  position: relative;

  @include desktop {
    top: -32px;
  }
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