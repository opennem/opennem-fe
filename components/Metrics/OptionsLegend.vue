<template>
  <div class="options-legend-wrapper">
    <div class="options">
      <div class="metric-selection select is-rounded">
        <select v-model="selectedMetric">
          <option
            v-for="(d, i) in metrics"
            :key="`metric-${i}`"
            :value="d.value"
          >
            {{ d.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="right-col">
      <ColourLegend
        v-if="showLegend"
        :svg-width="legendWidth"
        :font-size="legendFontSize"
        :svg-height="30"
        :unit="
          selectedMetricObj.value === 'carbonIntensity'
            ? ''
            : selectedMetricObj.unit
        "
        :multiplier="selectedMetricObj.divisor"
        :offset="selectedMetricObj.offset"
        :colour-range="selectedMetricObj.range"
        :colour-domain="selectedMetricObj.domain"
        :colour-domain-label="selectedMetricObj.domainLabel"
        :zero-block="selectedMetricObj.showZeroBlock"
        :type="selectedMetricObj.legendType"
        class="colour-legend"
      />

      <div
        v-if="useHover"
        class="hover-metric-wrapper">
        <HoverMetric
          v-if="showHover"
          :hover-display="hoverDisplay"
        />
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  periods,
  metrics,
  yearsBucket,
  allRangeBucket,
  yearDailyRangeBucket
} from '@/constants/metrics/'
import ColourLegend from '@/components/Vis/ColourLegend'
import HoverMetric from '@/components/Metrics/HoverMetric'

export default {
  components: {
    ColourLegend,
    HoverMetric
  },

  props: {
    showLegend: {
      type: Boolean,
      default: true
    },
    legendWidth: {
      type: Number,
      default: 310
    },
    legendFontSize: {
      type: Number,
      default: 10
    },
    useHover: {
      type: Boolean,
      default: false
    },
    showHover: {
      type: Boolean,
      default: false
    },
    hoverDisplay: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      metrics
    }
  },

  computed: {
    ...mapGetters({
      selectedMetricObj: 'metrics/selectedMetricObj'
    }),
    selectedMetric: {
      get() {
        return this.$store.getters['metrics/selectedMetric']
      },

      set(val) {
        this.$router.push({
          query: {
            metric: val
          }
        })
        this.$store.commit('metrics/selectedMetric', val)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.options-legend-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: sticky;
  z-index: 99;
  top: 0;
  padding: 1rem 0;
  background-color: $beige-lighter;
  border-bottom: 1px solid #ddd;

  @include mobile {
    // display: block;
    border-bottom: 1px solid #999;
  }
}
.options {
  display: flex;
  align-items: center;

  @include mobile {
    margin-right: 1rem;
  }

  & > * {
    // margin: 0 1rem;
  }

  label {
    margin: 0 0.5rem 0 0;
  }
}

.metric-selection {
  width: 100%;
  select {
    width: 100%;
  }
}

.colour-legend {
  margin-top: 4px;
  @include mobile {
    // margin-top: 1rem;
  }
}

.right-col {
  @include mobile {
    // display: flex;
    // justify-content: space-between;
    // align-items: center;
  }
}

.hover-metric-wrapper {
  height: 20px;
  display: flex;
  justify-content: flex-end;
  position: relative;
  top: 3px;

  @include mobile {
    width: 200px;
  }
}

::v-deep .hover-date-value {
  position: static;
}
</style>
