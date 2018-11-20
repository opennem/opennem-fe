<template>
  <div class="date-range">
    <!-- <div>
      <datepicker v-model="currentDate"></datepicker>
    </div> -->
    
    <div class="buttons">
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
    <div class="buttons has-addons">
      <span 
        class="button is-rounded is-small is-primary"
        v-for="p in groupToPeriods"
        :class="{ 'is-inverted': currentPeriod !== p }"
        :key="p"
        @click="handlePeriodClick(p)"
      >
        {{ getPeriodLabel(p) }}
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

export default {
  name: 'range-selector',

  components: {
    // Datepicker,
  },

  data() {
    return {
      dateSelectors: DateRanges.slice(0),
      currentDate: new Date(),
      currentPeriod: null,
    };
  },

  watch: {
    currentDate(date) {
      // for fetching week data
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
    }),
  },

  mounted() {
    this.currentPeriod = this.groupToPeriods[this.groupToPeriods.length - 1];
  },

  methods: {
    getPeriodLabel(period) {
      return Periods.PERIOD_LABELS[period];
    },

    handleSelection(range) {
      if (range.id !== this.currentRange) {
        this.$store.dispatch('fetchingData', true);
        this.$store.dispatch('setChartZoomed', false);
        this.$store.dispatch('setVisType', range.visType);
        this.$store.dispatch('currentRange', range.id);
        this.$store.dispatch('groupToPeriods', range.groupToPeriods);
        this.$store.dispatch('chartTypeTransition', false);

        this.currentPeriod = range.groupToPeriods[range.groupToPeriods.length - 1];
      }
    },

    handlePeriodClick(period) {
      this.$store.dispatch('period', period);
    },
  },
};
</script>

<style lang="scss" scoped>
.date-range {
  display: flex;

  .buttons {
    margin-bottom: 0 !important;
    padding-top: .4rem;

    &.has-addons {
      margin-left: 1rem;
      padding-left: 1rem;
      border-left: 1px solid #ccc;
    }
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
</style>
