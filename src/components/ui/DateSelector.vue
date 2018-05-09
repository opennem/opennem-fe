<template>
  <div class="date-range">
    <transition name="slide-fade" mode="out-in">
      <loader class="fetching" v-if="isFetching" />
      <div v-else class="dropdown" :class="{'is-active': dropdownActive}">
        <div v-if="isPointHovered">
          {{pointDate}}
        </div>
        <div v-else>
          <a class="dropdown-trigger" v-on-clickaway="onClickAway" @click="handleClick">
            {{formattedStartDate}}
            <span v-if="showEndDate"> – {{formattedEndDate}}</span>
          </a>
        </div> 
        <!-- local time -->
        <!-- <div class="date-helper"><small>(local time)</small></div> -->

        <transition name="slide-down-fade">
          <div v-if="dropdownActive" class="dropdown-menu">
            <div class="dropdown-content">
              <a class="dropdown-item" @click="handleLast24HrsSelection">
                Last 24 hours
              </a>
              <a class="dropdown-item" @click="handleLast7DaysSelection">
                Last 7 days
              </a>
              <a class="dropdown-item" @click="handleLast30DaysSelection">
                Last 30 days
              </a>
            </div>
          </div>
        </transition> 
      </div>
    </transition>
  </div>
</template>

<script>
import * as moment from 'moment';
import { mapGetters } from 'vuex';
import { mixin as clickaway } from 'vue-clickaway';
import { formatDateForDisplay } from '@/lib/formatter';
import { getLast24HoursStartEndDates, isMidnight } from '@/lib/data-helpers';
import { getRegionOffset } from '@/domains/regions';
import EventBus from '@/lib/event-bus';
import Loader from './Loader';

export default {
  name: 'date-selector',
  mixins: [clickaway],
  components: {
    Loader,
  },
  data() {
    return {
      dropdownActive: false,
    };
  },
  computed: {
    ...mapGetters({
      isFetching: 'isFetching',
      isPointHovered: 'isPointHovered',
      dataEndDate: 'getDataEndDate',
      startDate: 'getSelectedStartDate',
      endDate: 'getSelectedEndDate',
    }),
    regionOffset() {
      return getRegionOffset(this.$route.params.region);
    },
    pointDate() {
      return formatDateForDisplay(this.$store.getters.getPointSummary.date, this.regionOffset);
    },
    formattedStartDate() {
      return formatDateForDisplay(this.$store.getters.getSelectedStartDate, this.regionOffset);
    },
    formattedEndDate() {
      return formatDateForDisplay(this.$store.getters.getSelectedEndDate, this.regionOffset);
    },
    showEndDate() {
      const midnight = isMidnight(this.startDate);
      const aDayApart = moment(this.startDate).isSame(moment(this.endDate).subtract(1, 'day'));
      return !(midnight && aDayApart);
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
    handleClick() {
      const isActive = !this.dropdownActive;
      this.dropdownActive = isActive;
    },
    handleLast24HrsSelection() {
      const last24Hrs = getLast24HoursStartEndDates(this.dataEndDate);
      this.$store.dispatch('saveSelectedDates', last24Hrs);
      this.$store.dispatch('setChartZoomed', true);
      this.$store.dispatch('setVisType', 'power');
      EventBus.$emit('data.fetch.latest');
    },
    handleLast7DaysSelection() {
      this.$store.dispatch('setChartZoomed', false);
      this.$store.dispatch('setVisType', 'power');
      EventBus.$emit('data.fetch.latest');
    },
    handleLast30DaysSelection() {
      this.$store.dispatch('setChartZoomed', false);
      this.$store.dispatch('setVisType', 'energy');
      EventBus.$emit('data.fetch.latest.30.days');
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
  font-size: 0.8rem;
  margin-top: 0.6rem;
  

  @include tablet {
    font-size: 1rem;
  }

  a.dropdown-trigger {
    color: #000;
    border-bottom: 1px dashed $opennem-primary-alpha;
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