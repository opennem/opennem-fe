<template>
  <div class="date-range">
    <transition name="slide-fade" mode="out-in">
      <div v-if="!isFetching" class="dropdown" :class="{'is-active': dropdownActive}">
        <div class="point-date" v-if="isPointHovered">
          {{pointDate}}
        </div>
        <div v-else>
          <a class="dropdown-trigger" v-on-clickaway="onClickAway" @click="handleClick">
            {{formattedStartDate}}
            <span v-if="showEndDate"> – {{formattedEndDate}}</span>
            <font-awesome-icon class="fal fa-lg" :icon="iconDown" />
          </a>
        </div> 
        <!-- local time -->
        <!-- <div class="date-helper"><small>(local time)</small></div> -->

        <transition name="slide-down-fade">
          <div v-if="dropdownActive" class="dropdown-menu">
            <div class="dropdown-content">
              <a class="dropdown-item"
                  v-for="(row, index) in dateSelectors" 
                  :key="row.id"
                  v-show="moreDateRanges || index < 2"
                  @click="handleSelection(row)"
                  :class="{ 'selected': currentRange === row.id }">
                {{row.label}}
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
    }),
    iconDown() {
      return faAngleDown;
    },
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
  font-size: 0.8rem;
  margin-top: 0.6rem;

  @include tablet {
    font-size: 1rem;
  }

  .dropdown {
    margin-right: 0.5rem;
  }
  .point-date {
    margin-right: 1rem;
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