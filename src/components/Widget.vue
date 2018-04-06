<template>
  <div class="container">
    <header>
      <a target="_blank" :href="headerLink">
        <img class="logo" src="../assets/opennem-logo.svg" alt="OpenNEM logo">            
        <strong>National Electricity Market</strong>
      </a>
    </header>

    <div class="zoom-out-btn">
      <transition name="fade">
        <button class="button is-small is-rounded is-danger is-inverted" 
          @click="handleZoomOutClicked" 
          v-if="isChartZoomed && !isFetching">Reset Zoom</button>
      </transition>
    </div>

    <div class="chart" v-show="!isFetching">
      <widget-chart :chartData="chartData" />
    </div>
    <div class="table" v-if="!isFetching" :class="{ small: isSmall, large: isLarge }">
      <all-regions-summary v-if="isLarge" />
      
      <transition name="slide-fade">
        <widget-legend v-if="isSmall && showLegend" />
      </transition>
    </div>

    <footer class="level is-mobile" v-if="!isFetching">
      <div class="level-left">
        <a :href="openNEMLink">OpenNEM</a> is a project of 
        the <a :href="ethLink">Energy Transition Hub</a>
      </div>
      <div class="utils level-right" v-if="isSmall">
        <a @click="toggleLegend"><font-awesome-icon class="fas fa-lg fa-fw" :icon="iconLegend" /></a>
        <a :href="renewEcoWidgetLink"><font-awesome-icon class="fas fa-lg fa-fw" :icon="iconInfo" /></a>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import {
  faListAlt,
  faInfoCircle,
} from '@fortawesome/fontawesome-free-solid';
import EventBus from '@/lib/event-bus';
import getJSON from '@/lib/data-apis';
import dataTransform from '@/lib/data-transform';
import { 
  getStartEndDates, 
  dataFilter,
  getLast3DaysStartEndDates } from '@/lib/data-helpers';
import { GraphDomains } from '@/domains/graphs';
import WidgetChart from './Widget/Chart';
import WidgetLegend from './Widget/Legend';
import AllRegionsSummary from './AllRegions/Summary';

export default {
  components: {
    WidgetChart,
    WidgetLegend,
    AllRegionsSummary,
    FontAwesomeIcon,
  },
  props: {
    size: String,
  },
  data() {
    return {
      chartData: [],
      showLegend: false,
      renewEcoWidgetLink: 'http://reneweconomy.com.au/opennem-widget/',
      openNEMLink: 'https://opennem.org.au/',
      ethLink: 'http://energy-transition-hub.org/',
    };
  },
  created() {
    this.$store.dispatch('setDomains', GraphDomains);
    this.fetchNem();
  },
  mounted() {
    EventBus.$on('data.fetch.latest', this.fetchNem);
  },
  beforeDestroy() {
    EventBus.$off('data.fetch.latest');
  },
  computed: {
    ...mapGetters({
      isFetching: 'isFetching',
      isChartZoomed: 'isChartZoomed',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
    }),
    isSmall() {
      return this.size === 'small';
    },
    isLarge() {
      return this.size === 'large';
    },
    headerLink() {
      return this.isSmall ? this.renewEcoWidgetLink : this.openNEMLink;
    },
    iconLegend() {
      return faListAlt;
    },
    iconInfo() {
      return faInfoCircle;
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
    toggleLegend() {
      const toggle = !this.showLegend;
      this.showLegend = toggle;
    },
    fetchNem() {
      this.$store.dispatch('fetchingData', true);
      const url = 'static/data/nem.json';
 
      getJSON(url).then((response) => {
        const transformedData = dataTransform(GraphDomains, response.data);
        const endDate = transformedData[transformedData.length - 1].date;

        if (this.isSmall) {
          const startEndDates = getLast3DaysStartEndDates(endDate);
          this.chartData = dataFilter(transformedData, startEndDates.start, startEndDates.end);
        } else {
          this.chartData = transformedData;
        }

        this.$store.dispatch('setDataEndDate', endDate);
        this.$store.dispatch('fetchingData', false);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../styles/variables.scss";

.container {
  border-top: 1px solid $opennem-primary;
  padding: 0 0.5rem;
}

header {
  font-family: $header-font-family;
  padding: 0.5rem;

  .logo {
    margin-right: 0.1rem;
    max-height: 1.6rem;
    vertical-align: middle;

    @include tablet {
      max-height: 2rem;
    }
  }

  strong {
    position: relative;
    top: 2px;
    color: #000;
  }
}

footer {
  font-size: 0.7rem;
  border-top: 1px solid #ccc;
  padding-top: 0.5rem;

  a {
    border-bottom: 1px dashed;
    display: inline-block;
    margin: 0 0.1rem;
  }

  .utils a {
    border-bottom: none;
  }
}

.table {
  &.large table {
    width: 100%;
  }

  &.small table {
    position: absolute;
    bottom: 0;
    right: 0;
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