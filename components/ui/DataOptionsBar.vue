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
      v-if="showComparePeriod"
      class="compare-period-buttons buttons has-addons">
      <span
        :class="{ 'is-selected': comparePeriod }"
        class="button is-rounded"
        @click="handleComparePeriodClick">
        All
      </span>
      <span
        :class="{ 'is-selected': comparePeriod }"
        class="button is-rounded"
        @click="handleComparePeriodClick">
        Q1
      </span>
      <span
        :class="{ 'is-selected': comparePeriod }"
        class="button is-rounded"
        @click="handleComparePeriodClick">
        Q2
      </span>
      <span
        :class="{ 'is-selected': comparePeriod }"
        class="button is-rounded"
        @click="handleComparePeriodClick">
        Q3
      </span>
      <span
        :class="{ 'is-selected': comparePeriod }"
        class="button is-rounded"
        @click="handleComparePeriodClick">
        Q4
      </span>
    </div>
  </div>
</template>

<script>
import RANGE_INTERVAL from '~/constants/rangeInterval.js'

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
      selectedRange: '',
      selectedInterval: ''
    }
  },

  computed: {
    selectedRangeIntervals() {
      const range = this.ranges.find(r => r.range === this.selectedRange)
      return range ? range.intervals : null
    },
    comparePeriod() {
      return this.$store.getters.comparePeriod
    },
    showComparePeriod() {
      return this.interval === 'Quarter'
    }
  },

  watch: {
    range(updated) {
      this.selectedRange = updated
    },
    interval(updated) {
      this.selectedInterval = updated
    }
  },

  mounted() {
    this.selectedRange = this.range
    this.selectedInterval = this.interval
  },

  methods: {
    handleRangeChange(range) {
      this.$emit('onRangeChange', range)
    },
    handleIntervalChange(interval) {
      this.$emit('onIntervalChange', interval)
    },
    handleComparePeriodClick() {
      this.$store.dispatch('comparePeriod', !this.comparePeriod)
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
.compare-period-buttons {
  margin-left: 1rem;
}
</style>
