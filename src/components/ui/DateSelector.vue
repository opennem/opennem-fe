<template>
  <div class="date-range">
    <div v-show="!isFetching" class="dropdown" :class="{'is-active': dropdownActive}">
      <div class="point-date" v-if="isPointHovered">
        {{ formattedPoint(getPointSummary.date, currentRange) }}
      </div>
      <div v-else>
        {{ formattedRange(startDate, endDate, currentRange) }}
        <!-- <a class="dropdown-trigger" v-on-clickaway="onClickAway" @click="handleClick">
          {{ formattedRange(startDate, endDate, currentRange) }}
          <font-awesome-icon class="fal fa-lg" :icon="iconDown" />
        </a> -->
      </div> 
      <!-- local time -->
      <!-- <div class="date-helper"><small>(local time)</small></div> -->

      <transition name="slide-down-fade">
        <div v-if="dropdownActive" class="dropdown-menu">
          <div class="dropdown-content">
            <a class="dropdown-item"
                v-for="(row, index) in dateSelectors" 
                :key="row.id"
                v-show="moreDateRanges || index < 3"
                @click="handleSelection(row)"
                :class="{ 'selected': currentRange === row.id }">
              {{row.label}}
            </a>
          </div>
        </div>
      </transition> 
    </div>
  </div>
</template>

<script>
import { select } from 'd3-selection';
import * as moment from 'moment';
import { mapGetters } from 'vuex';
import { mixin as clickaway } from 'vue-clickaway';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faAngleDown } from '@fortawesome/fontawesome-pro-light';
import { formatDateForDisplay } from '@/lib/formatter';
import { isMidnight } from '@/lib/data-helpers';
import { getRegionOffset } from '@/domains/regions';
import { DateRanges } from '@/domains/date-ranges';


export default {
  name: 'date-selector',
  mixins: [clickaway],
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      dropdownActive: false,
      dateSelectors: DateRanges,
    };
  },
  computed: {
    ...mapGetters({
      isFetching: 'isFetching',
      isPointHovered: 'isPointHovered',
      dataEndDate: 'getDataEndDate',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
      currentRange: 'currentRange',
      moreDateRanges: 'moreDateRanges',
      getPointSummary: 'getPointSummary',
      currentInterval: 'currentInterval',
      chartTypeTransition: 'chartTypeTransition',
    }),
    iconDown() {
      return faAngleDown;
    },
    regionOffset() {
      return getRegionOffset(this.$route.params.region);
    },
  },
  watch: {
    isPointHovered(hovered) {
      if (hovered) {
        this.onClickAway();
      }
    },
  },
  methods: {
    formattedPoint(date, currentRange) {
      let range = '';

      switch (currentRange) {
        case 'last30days':
          if (this.chartTypeTransition) {
            range = `${formatDateForDisplay(date)}`;
          } else {
            range = moment(date).format('D MMM YYYY');
          }
          break;

        case 'last52weeksWeekly':
        case '2017Weekly':
        case 'lastYear':
          if (this.chartTypeTransition) {
            range = formatDateForDisplay(date);
          } else if (this.currentInterval === 'DD') {
            range = formatDateForDisplay(date);
          } else if (this.currentInterval === 'MM') {
            range = moment(date).format('MMM YYYY');
          } else if (this.currentInterval === '3MM') {
            range = this.quarterlyDateDisplay(date, date);
          } else {
            range = this.weeklyDateDisplay(date, date);
          }
          break;

        case 'last52weeksMonthly':
        case '2017Monthly':
          if (this.chartTypeTransition) {
            range = formatDateForDisplay(date);
          } else if (this.currentInterval === 'DD') {
            range = formatDateForDisplay(date);
          } else if (this.currentInterval === '3MM') {
            range = this.quarterlyDateDisplay(date, date);
          } else {
            range = moment(date).format('MMM YYYY');
          }
          break;

        case 'allMonthly':
          range = moment(date).format('YYYY');

          if (this.chartTypeTransition) {
            range = formatDateForDisplay(date);
          } else if (this.currentInterval === 'DD') {
            range = formatDateForDisplay(date);
          } else if (this.currentInterval === 'MM') {
            range = moment(date).format('MMM YYYY');
          } else if (this.currentInterval === '3MM') {
            range = this.quarterlyDateDisplay2(date, date);
            this.updateAxisLabel(range, '12px');
          } else if (this.currentInterval === 'S3MM') {
            range = this.seasonallyDateDisplay(date, date);
            this.updateAxisLabel(range);
          } else if (this.currentInterval === 'FY') {
            range = this.financialYearlyDateDisplay(date, date);
            this.updateAxisLabel(range, '12px');
          } else {
            range = moment(date).format('YYYY');
          }
          break;

        default:
          range = `${formatDateForDisplay(date)}`;
      }

      return range;
    },

    formattedRange(start, end, currentRange) {
      let range = '';

      switch (currentRange) {
        case 'last24hrs':
        case 'last3days':
        case 'last7days':
          range = this.minutelyDateDisplay(start, end);
          break;

        case 'last30days':
          if (this.chartTypeTransition) {
            range = this.minutelyDateDisplay(start, end);
          } else {
            range = this.dailyDateDisplay(start, end);
          }
          break;

        case 'last52weeksWeekly':
        case '2017Weekly':
        case 'lastYear':
          if (this.chartTypeTransition) {
            range = this.minutelyDateDisplay(start, end);
          } else if (this.currentInterval === 'DD') {
            range = this.dailyDateDisplay(start, end);
          } else if (this.currentInterval === 'MM') {
            range = this.monthlyDateDisplay(start, end);
          } else if (this.currentInterval === '3MM') {
            range = this.quarterlyDateDisplay(start, end);
          } else {
            range = this.weeklyDateDisplay(start, end);
          }
          break;

        case 'last52weeksMonthly':
        case '2017Monthly':
          if (this.currentInterval === '3MM') {
            range = this.quarterlyDateDisplay(start, end);
          } else {
            range = this.monthlyDateDisplay(start, end);
          }
          break;

        case 'allMonthly':
          if (this.chartTypeTransition) {
            range = this.minutelyDateDisplay(start, end);
          } else if (this.currentInterval === 'DD') {
            range = this.dailyDateDisplay(start, end);
          } else if (this.currentInterval === 'MM') {
            range = this.monthlyDateDisplay(start, end);
          } else if (this.currentInterval === '3MM') {
            range = this.quarterlyDateDisplayRange(start, end);
          } else if (this.currentInterval === 'S3MM') {
            range = this.seasonallyDateDisplayRange(start, end);
          } else if (this.currentInterval === 'FY') {
            range = this.financialYearlyDateDisplayRange(start, end);
          } else {
            range = this.yearlyDateDisplay(start, end);
          }
          break;

        default:
          range = `${formatDateForDisplay(start)} – ${formatDateForDisplay(end)}`;
      }

      return range;
    },

    minutelyDateDisplay(start, end) {
      const startAdd1Day = moment(start).add(1, 'day');
      const isSameDay = moment(startAdd1Day).isSame(end, 'day');
      const startDate = formatDateForDisplay(start);
      const endDate = formatDateForDisplay(end);

      let display = `${startDate} – ${endDate}`;

      if (isSameDay && isMidnight(start)) {
        display = `${startDate}`;
      }

      return display;
    },

    dailyDateDisplay(start, end) {
      const isSameYear = moment(start).isSame(end, 'year');
      const isSameMonth = moment(start).isSame(end, 'month');

      let startFormat = 'D MMM YYYY';

      if (isSameMonth) {
        startFormat = 'D';
      } else if (isSameYear) {
        startFormat = 'D MMM';
      }

      return `${moment(start).format(startFormat)} – ${moment(end).format('D MMM YYYY')}`;
    },

    weeklyDateDisplay(start, end) {
      const endDate = moment(end).add(6, 'days');
      const isSameYear = moment(start).isSame(endDate, 'year');
      const isSameMonth = moment(start).isSame(endDate, 'month');

      let startFormat = 'D MMM YYYY';

      if (isSameMonth) {
        startFormat = 'D';
      } else if (isSameYear) {
        startFormat = 'D MMM';
      }

      return `${moment(start).format(startFormat)} – ${endDate.format('D MMM YYYY')}`;
    },

    monthlyDateDisplay(start, end) {
      const isSameYear = moment(start).isSame(end, 'year');

      let startFormat = 'MMM YYYY';

      if (isSameYear) {
        startFormat = 'MMM';
      }

      return `${moment(start).format(startFormat)} – ${moment(end).format('MMM YYYY')}`;
    },

    quarterlyDateDisplay(start, end) {
      const endDate = moment(end).add(2, 'months');
      const isSameYear = moment(start).isSame(endDate, 'year');

      let startFormat = 'MMM YYYY';

      if (isSameYear) {
        startFormat = 'MMM';
      }

      return `${moment(start).format(startFormat)} – ${endDate.format('MMM YYYY')}`;
    },

    quarterlyDateDisplay2(start) {
      const startDate = moment(start);
      const quarter = this.getQuarterLabel(startDate.month());
      const display = `${quarter} ${startDate.format('YYYY')}`;
      return display;
    },

    quarterlyDateDisplayRange(start, end) {
      const startQuarter = this.quarterlyDateDisplay2(start, start);
      const endQuarter = this.quarterlyDateDisplay2(end, end);

      return `${startQuarter} – ${endQuarter}`;
    },

    seasonallyDateDisplay(start, end) {
      const endDate = moment(end).add(2, 'months');
      const startDate = moment(start);
      const isSameYear = startDate.isSame(endDate, 'year');
      const season = this.getSeasonLabel(startDate.month());
      let dates = endDate.format('YYYY');

      if (!isSameYear) {
        dates = `${startDate.format('YY')}/${endDate.format('YY')}`;
      }

      const display = `${season} ${dates}`;

      return display;
    },

    seasonallyDateDisplayRange(start, end) {
      const startSeason = this.seasonallyDateDisplay(start, start);
      const endSeason = this.seasonallyDateDisplay(end, end);

      return `${startSeason} – ${endSeason}`;
    },

    financialYearlyDateDisplay(start, end) {
      // const startDate = moment(start);
      // const startMonth = startDate.month();
      // let startYear = startDate.year();

      const endDate = moment(end);
      const endMonth = endDate.month();
      let endYear = endDate.format('YY');

      // if (startMonth >= 0 && startMonth < 6) {
      //   startYear = startDate.subtract(1, 'year').format('YY');
      // }

      if (endMonth > 5 && endMonth < 12) {
        endYear = endDate.add(1, 'year').format('YY');
      }

      const display = `FY${endYear}`;
      this.updateAxisLabel(display);

      return display;
    },

    financialYearlyDateDisplayRange(start, end) {
      const startFY = this.financialYearlyDateDisplay(start, start);
      const endFY = this.financialYearlyDateDisplay(end, end);

      return `${startFY} – ${endFY}`;
    },

    yearlyDateDisplay(start, end) {
      const format = 'YYYY';

      return `${moment(start).format(format)} – ${moment(end).format(format)}`;
    },

    updateAxisLabel(display, fontSize) {
      select('.amcharts-balloon-div-categoryAxis div')
        .style('font-size', fontSize || '10px')
        .text(display);
    },

    getSeasonLabel(month) {
      let season = '';

      switch (month) {
        case 2:
          season = 'Autumn';
          break;
        case 5:
          season = 'Winter';
          break;
        case 8:
          season = 'Spring';
          break;
        case 11:
          season = 'Summer';
          break;
        default:
      }

      return season;
    },

    getQuarterLabel(month) {
      let quarter = '';
      switch (month) {
        case 0:
          quarter = 'Q1';
          break;
        case 3:
          quarter = 'Q2';
          break;
        case 6:
          quarter = 'Q3';
          break;
        case 9:
          quarter = 'Q4';
          break;
        default:
      }

      return quarter;
    },

    handleClick() {
      const isActive = !this.dropdownActive;
      this.dropdownActive = isActive;
    },
    handleSelection(range) {
      if (range.id !== this.currentRange) {
        this.$store.dispatch('fetchingData', true);
        this.$store.dispatch('setChartZoomed', false);
        this.$store.dispatch('setVisType', range.visType);
        this.$store.dispatch('currentRange', range.id);
        this.$store.dispatch('groupToPeriods', range.groupToPeriods);
        this.$store.dispatch('chartTypeTransition', false);
      }
    },
    onClickAway() {
      this.dropdownActive = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

.date-range {
  font-family: $primary-font-family;

  .dropdown {
    margin-right: 0.5rem;
  }

  a.dropdown-trigger {
    color: #000;
    padding: 0.5rem 1rem;
    border-radius: 1rem;

    &:hover {
      background-color: rgba(255,255,255,0.5);
    }

    .fal {
      color: $opennem-primary-alpha;
      position: relative;
      top: 1px;
      left: 3px;
    }
  }
}

.dropdown-menu {
  width: 250px;

  @include tablet {
    right: 0;
    left: auto;
  }
}

.date-helper {
  font-size: 0.7rem;
  margin: .15rem 0 0 0.15rem;

  @include tablet {
    font-size: 0.8rem;
    margin: .2rem 0 0 0.3rem;
  }
}
</style>