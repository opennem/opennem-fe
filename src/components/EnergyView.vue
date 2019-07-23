<template>
<div>
  <transition name="slide-fade">
    <div v-if="isFetching" class="loading">
      <ui-loader />
    </div>
  </transition>

  <div style="display: flex; align-items: center; position: relative; z-index: 9; margin-bottom: 10px;">
    <range-selector class="range-selector-container" v-if="!isExportPng" />
    <!-- <group-selection style="margin-left: 1rem;" /> -->
  </div>
  
  <transition name="fade">
    <div class="columns is-desktop is-gapless is-1" style="justify-content: center;" v-show="!isFetching">
      <div class="column" :class="{ export: isExportPng }">
        <div id="export-container">
          <export-png-header v-if="isExportPng" />

          <div style="position: relative;">
            <transition name="fade">
              <ui-zoom-out-button v-if="isChartZoomed && !isFetching && !isExportPng" />
            </transition>

            <panel-button />
            <chart-tips v-if="!isExportPng" />
            <all-regions-chart :chartData="groupedNemData" :nemData="nemData" :customDomains="customDomains" v-show="!error" />
            <div v-if="isExportPng">
              <all-regions-summary v-if="showSummaryPanel" />
              <export-legend v-else />
            </div>
          </div>
          
          <export-png-footer v-if="isExportPng" :hideTopBorder="showSummaryPanel" />
        </div>
      </div>

      <div class="column is-narrow" v-show="!isExportPng && !error">
        <all-regions-summary class="all-regions-summary" />
        <all-regions-extent v-if="isPower" />
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
import RangeSelector from './ui/RangeSelector';
import ChartTips from './ui/ChartTips';

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
    RangeSelector,
    ChartTips,
  },
  created() {
    this.$store.dispatch('region', 'nem');
    this.$store.dispatch('setExportRegion', 'OpenNEM');
    this.$store.dispatch('setDomains', GraphDomains);
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
  data() {
    return {
      selectedRange: null,
    };
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
      showSummaryPanel: 'showSummaryPanel',
      visType: 'visType',
      currentRange: 'currentRange',
      error: 'error',
      hasInterval: 'hasInterval',
      currentInterval: 'currentInterval',
      yearsWeeks: 'yearsWeeks',
      isPower: 'isPower',
      nemUrls: 'nemUrls',
      groupSelected: 'groupSelected',
    }),
    records() {
      return this.$route.query.records;
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
    currentRange() {
      // when currentRange changes, refetch the data
      this.$store.dispatch('error', false);
      this.fetch();
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
        this.yearsWeeks.map(w => `${prependUrl}/nem${w}.json`) :
        [`${prependUrl}/nem${extension}.json`];

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
            return u.replace(replaceState, 'nem');
          }
          return u;
        });

        // console.log(this.nemUrls, newUrls)

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

.all-regions-summary {
  position: relative;

  @include desktop {
    top: -32px;
  }
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