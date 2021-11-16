<template>
  <div class="compare-container">
    <div class="compare-header">
      <div class="chart-label">
        <span v-if="isFY">FY</span>
        <strong>{{ firstDate | customFormatDate({ range, interval, showIntervalRange: true }) }}</strong>
        vs
        <span v-if="isFY">FY</span>
        <strong>{{ secondDate | customFormatDate({ range, interval, showIntervalRange: true }) }}</strong>
      </div>
    </div>
    <div class="compare-chart-legend">
      <!-- <div class="compare-legend">
        <div
          v-for="(domain, index) in domains"
          :key="`domain-${index}`"
          class="legend-item">
          <span
            :style="{
              'background-color': domain.colour,
              border: domain.id === '_total' ? `1px dashed #c74523` : 'none'
            }"
            class="colour-square" />
          {{ domain.label }}
        </div>
      </div> -->
      <div class="compare-chart">
        <div class="compare-chart-unit">{{ displayUnit }}</div>
        <column-vis
          v-if="hasCompareData"
          :domains="updatedDomains"
          :dataset="dataset"
          :unit="displayUnit"
          :dataset-percent="datasetPercent"
          :vis-height="visHeight"
          :display-prefix="chartDisplayPrefix"
          :convert-value="convertValue"
          :use-percentage="usePercentage"
        />
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _includes from 'lodash.includes'
import _cloneDeep from 'lodash.clonedeep'

import * as SI from '@/constants/si.js'
import ColumnVis from '~/components/Vis/Column.vue'
export default {
  components: {
    ColumnVis
  },

  props: {
    compareData: {
      type: Array,
      default: () => []
    },
    unit: {
      type: String,
      default: () => ''
    },
    domains: {
      type: Array,
      default: () => []
    },
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    },
    isFY: {
      type: Boolean,
      default: false
    },
    usePercentage: {
      type: Boolean,
      default: false
    },
    visHeight: {
      type: Number,
      default: 200
    }
  },

  data() {
    return {
      updatedCompareData: []
    }
  },

  computed: {
    ...mapGetters({
      highlightDomain: 'visInteract/highlightDomain',

      chartUnit: 'chartOptionsEmissionsVolume/chartUnit',
      chartYAxis: 'chartOptionsEmissionsVolume/chartYAxis',
      chartUnitPrefix: 'chartOptionsEmissionsVolume/chartUnitPrefix',
      chartDisplayPrefix: 'chartOptionsEmissionsVolume/chartDisplayPrefix'
    }),

    hasCompareData() {
      return this.updatedCompareData.length === 2
    },
    firstDate() {
      return this.hasCompareData ? this.updatedCompareData[0].time : null
    },
    secondDate() {
      return this.hasCompareData ? this.updatedCompareData[1].time : null
    },
    chartType() {
      return this.$store.getters.energyChartType
    },

    displayUnit() {
      return this.usePercentage ? '%' : this.unit
    },

    dataset() {
      if (this.hasCompareData) {
        const change = {}
        const former = this.updatedCompareData[0]
        const latter = this.updatedCompareData[1]
        Object.keys(latter).forEach(d => {
          if (d !== 'date' && d.length > 0) {
            change[d] = latter[d] - former[d]
          }
        })
        return change
      }
      return null
    },

    datasetPercent() {
      if (this.hasCompareData) {
        const changePercent = {}
        const former = this.updatedCompareData[0]
        const latter = this.updatedCompareData[1]
        Object.keys(latter).forEach(d => {
          if (d !== 'date' && d.length > 0) {
            if (
              former[d] === null ||
              latter[d] === null ||
              former[d] === 0 ||
              latter[d] === 0
            ) {
              changePercent[d] = null
            } else {
              changePercent[d] = ((latter[d] - former[d]) / former[d]) * 100
            }
          }
        })
        return changePercent
      }
      return null
    },

    updatedDomains() {
      return this.domains.map(d => {
        return {
          ...d,
          label: `${d.flag} ${d.id}`
        }
      })
    }
  },

  watch: {
    compareData() {
      this.updateData()
    },
    domains(val) {
      console.log(val)
      this.updateData()
    }
  },

  mounted() {
    // const $height = this.$el.offsetHeight < 200 ? 200 : this.$el.offsetHeight
    // this.visHeight = $height
    console.log(this.domains)
  },

  methods: {
    updateData() {
      console.log(this.domains, this.compareData)
      if (this.compareData.length === 2 && this.compareData[0]) {
        let latter = this.compareData[0]
        let former = this.compareData[1]
        if (this.compareData[1].date > latter.date) {
          latter = this.compareData[1]
          former = this.compareData[0]
        }
        this.updatedCompareData = [former, latter]
      } else {
        this.updatedCompareData = []
      }
    },
    convertValue(value) {
      return SI.convertValue(
        this.chartUnitPrefix,
        this.chartDisplayPrefix,
        value
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-label {
  text-align: center;
  font-size: 20px;
}
.compare-chart-legend {
  padding: 0.5rem 1rem;
  // margin: 0 0.5rem 0.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  // box-shadow: inset 0 1px 10px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  display: flex;
  align-items: center;

  .compare-legend {
    width: 20%;
    font-size: 9px;

    .legend-item {
      display: flex;
      align-items: center;
      padding: 0.1rem;
    }
  }
  .compare-chart {
    width: 100%;
  }
  .compare-chart-unit {
    font-size: 9px;
    font-weight: bold;
    padding-left: 4px;
  }
}
.colour-square {
  display: inline-block;
  border: 1px solid transparent;
  width: 15px;
  height: 15px;
  margin-right: 0.2rem;
}
</style>
