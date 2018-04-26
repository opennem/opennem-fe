<template>
  <div class="container">
    <header class="level is-mobile">
      <div class="level-left">
        <a target="_blank" :href="headerLink">
          <img class="logo" src="../assets/opennem-logo.svg" alt="OpenNEM logo">            
          <strong>National Electricity Market</strong>
        </a>
      </div>

      <div class="level-right" v-if="isLarge">
        <div v-if="isPointHovered">
          {{pointDate}}
        </div>
        <div v-else>
          {{formattedStartDate}} – {{formattedEndDate}}
        </div>  
      </div>
    </header>

    <transition name="fade">
      <zoom-out-button v-if="isChartZoomed && !isFetching" />
    </transition>

    <div class="chart" v-show="!isFetching">
      <widget-chart :chartData="chartData" />
    </div>
    <div class="table" v-if="!isFetching && isLarge">
      <all-regions-summary />
    </div>

    <div class="legend" v-if="!isFetching && isSmall">
      <transition name="slide-fade">
        <widget-legend v-if="showLegend" />
      </transition>
    </div>

    <footer class="level is-mobile" v-if="!isFetching">
      <div class="level-left">
        <a :href="openNEMLink" target="opennem-window">OpenNEM</a> is a project of 
        the <a :href="ethLink" target="opennem-window">Energy Transition Hub</a>
      </div>
      <div class="utils level-right" v-if="isSmall">
        <a @click="toggleLegend"><font-awesome-icon class="fas fa-lg fa-fw" :icon="iconLegend" /></a>
        <a :href="renewEcoWidgetLink" target="opennem-window"><font-awesome-icon class="fas fa-lg fa-fw" :icon="iconInfo" /></a>
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
import { formatDateForDisplay } from '@/lib/formatter';
import { GraphDomains } from '@/domains/graphs';
import WidgetChart from './Widget/Chart';
import WidgetLegend from './Widget/Legend';
import AllRegionsSummary from './AllRegions/Summary';
import ZoomOutButton from './ui/ZoomOutButton';

export default {
  components: {
    WidgetChart,
    WidgetLegend,
    AllRegionsSummary,
    FontAwesomeIcon,
    ZoomOutButton,
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
      isPointHovered: 'isPointHovered',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
    }),
    pointDate() {
      return formatDateForDisplay(this.$store.getters.getPointSummary.date);
    },
    formattedStartDate() {
      return formatDateForDisplay(this.$store.getters.getSelectedStartDate);
    },
    formattedEndDate() {
      return formatDateForDisplay(this.$store.getters.getSelectedEndDate);
    },
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
    toggleLegend() {
      const toggle = !this.showLegend;
      this.showLegend = toggle;
    },
    fetchNem() {
      this.$store.dispatch('fetchingData', true);
      const url = 'data/power/nem.json';

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

.level {
  padding: 0.5rem;
  margin-bottom: 0;

  .level-left {
    font-family: $header-font-family;
  }
  .level-right {
    font-size: 0.8rem;
    color: #000;
  }

  strong {
    position: relative;
    top: 2px;
    color: #000;
  }
}

footer {
  font-size: 0.6rem;
  border-top: 1px solid #ccc;
  padding-top: 0;

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
  table {
    width: 100%;
  }
}
.legend table {
  position: absolute;
  bottom: 1rem;
  right: 0;
}

</style>