<template>
  <div class="date-range">
    <!-- <div>
      <datepicker v-model="currentDate"></datepicker>
    </div> -->
    
    <div class="buttons has-addons">
      <span 
        class="button is-rounded is-small is-primary"
        :class="{ 'is-inverted': currentRange !== dateRange.id }"
        v-for="dateRange in dateSelectors"
        :key="dateRange.id"
        @click="handleSelection(dateRange)"
      >
        {{dateRange.label}}
      </span>
    </div>
    <div class="buttons has-addons interval-buttons">
      <span 
        class="button is-rounded is-small is-primary"
        v-for="p in periods"
        :class="{ 'is-inverted': !chartTypeTransition && currentInterval !== p }"
        :key="p"
        @click="handlePeriodClick(p)"
        :title="getPeriodLabel(p)"
      >
        {{ getPeriodShorthand(p) }}
      </span>
    </div>
  </div>
</template>

<script>
import * as moment from 'moment';
// import Datepicker from 'vuejs-datepicker';
import { mapGetters } from 'vuex';
import { DateRanges } from '@/domains/date-ranges';
import * as Periods from '@/constants/periods';
import EventBus from '@/lib/event-bus';
import { isMobileWidth } from '@/lib/browser';

export default {
  name: 'range-selector',

  data() {
    return {
      dateSelectors: DateRanges.slice(0),
      currentDate: new Date(),
      currentPeriod: null,
      periodShortHand: Periods.PERIOD_SHORTHAND_DESKTOP,
    };
  },

  watch: {
    currentDate(date) {
      // for fetching week data using DatePicker
      // console.log(moment(date).isoWeek(), moment(date).isoWeekYear());
      const mDate = moment(date);
      const week = mDate.isoWeek();
      const yearStr = `${mDate.isoWeekYear()}`;
      const weekStr = week < 10 ? `0${week}` : `${week}`;
      const url = `power/history/5minute/nem_${yearStr}W${weekStr}.json`;

      this.$store.dispatch('fetchData', [url]);
    },

    groupToPeriods(newPeriods) {
      this.currentPeriod = newPeriods[newPeriods.length - 1];
    },

    period(newPeriod) {
      this.currentPeriod = newPeriod;
    },

  },

  computed: {
    ...mapGetters({
      currentRange: 'currentRange',
      groupToPeriods: 'groupToPeriods',
      period: 'period',
      currentInterval: 'currentInterval',
      chartTypeTransition: 'chartTypeTransition',
      nemUrls: 'nemUrls',
      nemDataTrim: 'nemDataTrim',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
      datePeriodTransition: 'datePeriodTransition',
      region: 'region',
    }),
    periods() {
      let periods = [];
      switch (this.currentRange) {
        case 'last30days':
          periods = this.chartTypeTransition ? ['30mm'] : ['DD'];
          break;

        case 'lastYear':
          periods = this.chartTypeTransition ? ['30mm'] : ['DD', 'WW', 'MM'];
          break;

        case 'last52weeksWeekly':
        case '2017Weekly':
          periods = this.chartTypeTransition ? ['30mm'] : ['WW', 'MM', '3MM'];
          break;

        case 'last52weeksMonthly':
        case '2017Monthly':
          periods = this.chartTypeTransition ? ['30mm'] : ['DD', 'MM', '3MM'];
          break;

        case 'allMonthly':
          periods = this.chartTypeTransition ? ['30mm'] : ['MM', 'S3MM', '3MM', 'FY', 'YYYY'];
          break;

        case 'last24hrs':
          periods = ['5mm'];
          break;

        case 'last3days':
        case 'last7days':
        default:
          periods = ['5mm', '30mm'];
      }

      return periods;
    },
  },

  mounted() {
    this.currentPeriod = this.groupToPeriods[this.groupToPeriods.length - 1];
    if (isMobileWidth()) {
      this.periodShortHand = Periods.PERIOD_SHORTHAND_MOBILE;
    }
  },

  methods: {
    getPeriodShorthand(period) {
      return this.periodShortHand[period];
    },

    getPeriodLabel(period) {
      return Periods.PERIOD_LABELS[period];
    },

    handleSelection(range) {
      if (range.id !== this.currentRange) {
        this.currentPeriod = range.groupToPeriods[range.groupToPeriods.length - 1];

        switch (range.id) {
          case 'last52weeksMonthly':
          case 'allMonthly':
            this.$store.dispatch('groupToPeriods', ['MM']);
            this.$store.dispatch('currentInterval', 'MM');
            this.$store.dispatch('nemUrls', [`testing/${this.region}/energy/monthly/all.json`]);
            this.$store.dispatch('nemDataTrim', {});
            this.$store.dispatch('nemTrim', false);
            break;

          case 'lastYear': // eslint-disable-line
            const current = moment();
            const lastYear = moment().subtract(1, 'year');
            const isSameYear = moment(current).isSame(lastYear, 'year');
            const urls = [];

            if (!isSameYear) urls.push(`testing/${this.region}/energy/daily/${lastYear.year()}.json`);
            urls.push(`testing/${this.region}/energy/daily/${current.year()}.json`);

            this.$store.dispatch('groupToPeriods', ['WW']);
            this.$store.dispatch('currentInterval', 'WW');
            this.$store.dispatch('nemUrls', urls);
            this.$store.dispatch('nemTrim', true);
            this.$store.dispatch('nemDataTrim', {
              start: lastYear.subtract(1, 'minute').toDate(),
              end: current.toDate(),
            });
            break;
          
          case 'last24hrs':
          case 'last3days':
          case 'last7days':
            this.$store.dispatch('resetPanelsSelected');

          default:
            this.$store.dispatch('nemTrim', false);
            this.$store.dispatch('nemUrls', []);
            this.$store.dispatch('groupToPeriods', range.groupToPeriods);
            this.$store.dispatch('currentInterval', this.currentPeriod);
        }

        this.$store.dispatch('fetchingData', true);
        this.$store.dispatch('setChartZoomed', false);
        this.$store.dispatch('setVisType', range.visType);
        this.$store.dispatch('currentRange', range.id);
        this.$store.dispatch('chartTypeTransition', false);
        this.$store.dispatch('datePeriodTransition', false);
      }
    },

    handlePeriodClick(period) {
      if (!this.chartTypeTransition) {
        switch (this.currentRange) {
          case 'last52weeksMonthly':
          case 'allMonthly': // eslint-disable-line
            let p = [period];
            if (period === 'FY') p = [];
            if (period === 'S3MM') p = [];
            this.dispatch(this.currentRange, p, period);
            break;
          case 'lastYear':
            if (this.datePeriodTransition) {
              if (period === 'DD' || period === 'WW') {
                const year = moment(this.startDate).year();

                this.$store.dispatch('nemUrls', [`testing/${this.region}/energy/daily/${year}.json`]);
                this.$store.dispatch('nemDataTrim', {});
                this.$store.dispatch('nemTrim', false);

                this.dispatch(this.currentRange, [period], period);
              } else if (period === 'MM') {
                this.$store.dispatch('nemUrls', [`testing/${this.region}/energy/monthly/all.json`]);
                this.$store.dispatch('nemDataTrim', {
                  start: this.startDate,
                  end: this.endDate,
                });
                this.$store.dispatch('nemTrim', true);

                this.dispatch(this.currentRange, [period], period);
              }
            } else {
              this.dispatch(this.currentRange, [period], period);
            }

            break;

          default:
            this.$store.dispatch('fetchingData', true);
            this.$store.dispatch('groupToPeriods', [period]);
            this.$store.dispatch('currentInterval', period);
            this.$store.dispatch('period', period);
            EventBus.$emit('data.fetch');
        }
      }
    },

    dispatch(currentRange, groupToPeriods, period) {
      this.$store.dispatch('fetchingData', true);
      // this.$store.dispatch('setChartZoomed', false);
      this.$store.dispatch('setVisType', 'energy');
      this.$store.dispatch('currentRange', currentRange);
      this.$store.dispatch('groupToPeriods', groupToPeriods);
      this.$store.dispatch('chartTypeTransition', false);
      this.$store.dispatch('currentInterval', period);
      // this.$store.dispatch('period', period);
      EventBus.$emit('data.fetch');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.date-range {
  margin-top: .4rem;
  
  @include tablet {
    
  }

  .buttons {
    margin-bottom: 0 !important;
  }

  .button {
    font-weight: bold;
    font-size: .8rem;
  }

  .button.is-primary.is-inverted  {
    background-color: rgba(255, 255, 255, 0.4) !important;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.9) !important;
    }
  }
}
@media only screen and (min-width: 700px) {
  .date-range {
    display: flex;

    .interval-buttons {
      margin-left: 1rem;
    }
  }
}
</style>
