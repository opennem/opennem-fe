<template>
  <div class="data-options-bar">
    <div class="range-buttons buttons has-addons">
      <span
        v-for="(r, i) in ranges"
        :key="i"
        :class="{ 'is-selected': r.range === selectedRange }"
        class="button is-rounded"
        @click="handleRangeChange(r.range)">
        {{ r.range }}
      </span>
    </div>

    <div class="buttons has-addons">
      <span
        v-for="(interval, i) in selectedRangeIntervals"
        :key="i"
        :class="{ 'is-selected': interval === selectedInterval }"
        class="button is-rounded"
        @click="handleIntervalChange(interval)">
        {{ interval }}
      </span>
    </div>

    <div
      v-if="periodArray"
      class="filter-period-buttons buttons has-addons">
      <span
        v-for="(period, i) in periodArray"
        :key="`period${i}`"
        :class="{ 'is-selected': filterPeriod === period }"
        class="button is-rounded"
        @click="handleFilterPeriodClick(period)">
        {{ period }}
      </span>
    </div>

    <div
      :class="{ 'hide': drawer }"
      class="more-buttons">
      <div class="buttons has-addons">
        <span
          :class="{ 'is-selected': isConsumption }"
          class="button is-rounded"
          @click="handlePercentContributionToClick">Consumption</span><span
            :class="{ 'is-selected': isGeneration }"
            class="button is-rounded"
            @click="handlePercentContributionToClick">Generation</span>
      </div>
      
      <button
        v-if="(focusOn || compareDifference) && isEnergy && featureCompare"
        :class="{ 'is-selected': compareDifference }"
        class="compare-button button is-rounded"
        @click="handleCompareClick">Compare</button>
    </div>
  </div>
</template>

<script>
import RANGE_INTERVAL from '~/constants/rangeInterval.js'
import INTERVAL_PERIOD from '~/constants/intervalPeriod.js'

export default {
  props: {
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    }
  },

  data() {
    return {
      ranges: RANGE_INTERVAL,
      intervalPeriod: INTERVAL_PERIOD,
      selectedRange: '',
      selectedInterval: ''
    }
  },

  computed: {
    selectedRangeIntervals() {
      const range = this.ranges.find(r => r.range === this.selectedRange)
      return range ? range.intervals : null
    },
    filterPeriod() {
      return this.$store.getters.filterPeriod
    },
    compareDifference() {
      return this.$store.getters.compareDifference
    },
    focusOn() {
      return this.$store.getters.focusOn
    },
    periodArray() {
      return this.intervalPeriod[this.selectedInterval]
    },
    isEnergy() {
      return this.$store.getters.energyChartType === 'energy'
    },
    featureCompare() {
      return this.$store.getters.featureCompare
    },
    percentContributionTo() {
      return this.$store.getters.percentContributionTo
    },
    isConsumption() {
      return this.percentContributionTo === 'demand'
    },
    isGeneration() {
      return this.percentContributionTo === 'generation'
    },
    drawer() {
      return this.$store.getters.drawer
    }
  },

  watch: {
    range(updated) {
      this.selectedRange = updated
    },
    interval(updated) {
      this.selectedInterval = updated
    },
    periodArray(arr) {
      if (arr && !this.filterPeriod) {
        this.$store.dispatch('filterPeriod', 'All')
      }
    }
  },

  mounted() {
    this.selectedRange = this.range
    this.selectedInterval = this.interval
  },

  methods: {
    handleRangeChange(range) {
      this.$store.dispatch('filterPeriod', null)
      this.$emit('onRangeChange', range)
    },
    handleIntervalChange(interval) {
      const compareInterval = interval === 'Season' || interval === 'Quarter'
      const filterPeriod = compareInterval ? 'All' : null
      this.$store.dispatch('filterPeriod', filterPeriod)
      this.$emit('onIntervalChange', interval)
    },
    handleFilterPeriodClick(period) {
      this.$store.dispatch('filterPeriod', period)
      this.$store.dispatch('compareDifference', false)
      this.$store.dispatch('compareDates', [])
    },
    handleCompareClick() {
      this.$store.dispatch('compareDifference', !this.compareDifference)
      if (this.compareDifference) {
        this.$store.dispatch('focusOn', false)
      }
    },
    handlePercentContributionToClick() {
      if (this.isConsumption) {
        this.$store.dispatch('percentContributionTo', 'generation')
      } else {
        this.$store.dispatch('percentContributionTo', 'demand')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.data-options-bar {
  .buttons {
    background-color: rgba(255, 255, 255, 0.5);

    @include tablet {
      background-color: transparent;
    }
  }
  @include tablet {
    padding: $app-padding / 2 $app-padding;
    display: flex;
    align-items: center;
  }
}
.button {
  font-size: 11px;

  &.is-rounded {
    min-width: 55px;
  }

  @include mobile {
    border-radius: 0 !important;
  }
}
.range-buttons {
  @include tablet {
    margin-bottom: 0;
    margin-right: $app-padding;
  }
}
.filter-period-buttons {
  margin-left: 1rem;
}
.more-buttons {
  position: absolute;
  right: 0.5rem;

  @include mobile {
    top: 16px;
    z-index: 9999;

    &.hide {
      z-index: 1;
    }
  }

  .buttons {
    display: inline;
  }
}
</style>
