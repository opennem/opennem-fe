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
  </div>
</template>

<script>
import * as moment from 'moment';
// import Datepicker from 'vuejs-datepicker';
import { mapGetters } from 'vuex';
import { DateRanges } from '@/domains/date-ranges';

export default {
  name: 'range-selector',

  components: {
    // Datepicker,
  },

  data() {
    return {
      dateSelectors: DateRanges.slice(0),
      currentDate: new Date(),
    };
  },

  watch: {
    currentDate(date) {
      // console.log(moment(date).isoWeek(), moment(date).isoWeekYear());
      const mDate = moment(date);
      const week = mDate.isoWeek();
      const yearStr = `${mDate.isoWeekYear()}`;
      const weekStr = week < 10 ? `0${week}` : `${week}`;
      const url = `power/history/5minute/nem_${yearStr}W${weekStr}.json`;

      this.$store.dispatch('fetchData', [url]);
    },
  },

  computed: {
    ...mapGetters({
      currentRange: 'currentRange',
      groupToPeriods: 'groupToPeriods',
    }),
  },

  mounted() {},

  methods: {
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
  },
};
</script>

<style lang="scss" scoped>
.date-range {
  display: flex;

  .button {
    font-weight: bold;
    font-size: .8rem;
  }

  .button.is-primary.is-inverted  {
    background-color: rgba(255, 255, 255, 0.2) !important;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.9) !important;
    }
  }
}
</style>
