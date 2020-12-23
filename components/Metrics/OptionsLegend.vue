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

    <ColourLegend
      v-if="showLegend"
      :svg-width="legendWidth"
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

export default {
  components: {
    ColourLegend
  },

  props: {
    showLegend: {
      type: Boolean,
      default: true
    },
    legendWidth: {
      type: Number,
      default: 310
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
</style>
