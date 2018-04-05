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
            {{startDate}} – {{endDate}}
          </a>
        </div>  

        <transition name="slide-down-fade">
          <div v-if="dropdownActive" class="dropdown-menu">
            <div class="dropdown-content">
              <a class="dropdown-item" @click="handleLast24HrsSelection">
                Last 24 hours
              </a>
              <a class="dropdown-item" @click="handleLast7DaysSelection">
                Last 7 days
              </a>
            </div>
          </div>
        </transition> 
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { mixin as clickaway } from 'vue-clickaway';
import { formatDate } from '@/lib/formatter';
import { getLast24HoursStartEndDates } from '@/lib/data-helpers';
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
    }),
    pointDate() {
      return formatDate(this.$store.getters.getPointSummary.date);
    },
    startDate() {
      return formatDate(this.$store.getters.getSelectedStartDate);
    },
    endDate() {
      return formatDate(this.$store.getters.getSelectedEndDate);
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
      EventBus.$emit('data.fetch.latest');
    },
    handleLast7DaysSelection() {
      this.$store.dispatch('setChartZoomed', false);
      EventBus.$emit('data.fetch.latest');
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
</style>