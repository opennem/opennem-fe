<template>
  <div class="compare-container">
    <div class="compare-header">
      <div class="chart-label">
        <strong>{{
          firstDate
            | customFormatDate({ range, interval, showIntervalRange: true })
        }}</strong>
        vs
        <strong>{{
          secondDate
            | customFormatDate({ range, interval, showIntervalRange: true })
        }}</strong>
      </div>
    </div>
    <div class="compare-chart-legend">
      <!-- <div class="compare-legend">
        <div
          v-for="(domain, index) in updatedDomains"
          :key="`domain-${index}`"
          class="legend-item"
        >
          <span
            :style="{
              'background-color': domain.colour,
              border: domain.id === '_total' ? `1px dashed #c74523` : 'none'
            }"
            class="colour-square"
          />
          {{ domain.label }}
        </div>
      </div> -->
      <div class="compare-chart">
        <div class="compare-chart-unit">{{ unit }}</div>
        <column-vis
          v-if="hasCompareData"
          :domains="updatedDomains"
          :dataset="dataset"
          :unit="unit"
          :dataset-percent="datasetPercent"
          :vis-height="visHeight"
          :display-prefix="chartDisplayPrefix"
          :convert-value="convertValue"
          :highlight-domain="highlightId"
        />
      </div>
    </div>


    <Divider
      v-if="allowResize"
      :allow-x="false"
      :show="showDivider"
      @dragging="(d) => dragging = d" 
      @dragged="onDragged"
      @last-drag="() => draggedHeight = visHeight" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _includes from 'lodash.includes'
import _cloneDeep from 'lodash.clonedeep'
import Divider from '@/components/Divider.vue'

import * as OPTIONS from '@/constants/chart-options.js'
import { GROUP_DETAILED } from '@/constants/energy-fuel-techs'
import * as SI from '@/constants/si.js'
import ColumnVis from '~/components/Vis/Column.vue'
export default {
  components: {
    ColumnVis,
    Divider
  },

  props: {
    compareData: {
      type: Array,
      default: () => []
    },
    unit: {
      type: String,
      default: () => ''
    }
  },

  data() {
    return {
      updatedCompareData: [],
      visHeight: 300,
      showDivider: false,
      draggedHeight: 300,
      dragging: false
    }
  },

  computed: {
    ...mapGetters({
      fuelTechGroupName: 'fuelTechGroupName',
      hiddenFuelTechs: 'hiddenFuelTechs',
      currentDomainPowerEnergy: 'regionEnergy/currentDomainPowerEnergy',
      isEnergyType: 'regionEnergy/isEnergyType',
      allowResize: 'regionEnergy/allowResize',

      highlightDomain: 'visInteract/highlightDomain',

      chartEnergyYAxis: 'chartOptionsPowerEnergy/chartEnergyYAxis',
      chartEnergyUnit: 'chartOptionsPowerEnergy/chartEnergyUnit',
      chartEnergyUnitPrefix: 'chartOptionsPowerEnergy/chartEnergyUnitPrefix',
      chartEnergyDisplayPrefix:
        'chartOptionsPowerEnergy/chartEnergyDisplayPrefix',

      chartPowerYAxis: 'chartOptionsPowerEnergy/chartPowerYAxis',
      chartPowerUnit: 'chartOptionsPowerEnergy/chartPowerUnit',
      chartPowerUnitPrefix: 'chartOptionsPowerEnergy/chartPowerUnitPrefix',
      chartPowerDisplayPrefix: 'chartOptionsPowerEnergy/chartPowerDisplayPrefix'
    }),

    chartYAxis() {
      return this.isEnergyType ? this.chartEnergyYAxis : this.chartPowerYAxis
    },

    chartUnit() {
      return this.isEnergyType
        ? this.isYAxisAveragePower
          ? this.chartPowerUnit
          : this.chartEnergyUnit
        : this.chartPowerUnit
    },
    chartUnitPrefix() {
      return this.isEnergyType
        ? this.isYAxisAveragePower
          ? this.chartPowerUnitPrefix
          : this.chartEnergyUnitPrefix
        : this.chartPowerUnitPrefix
    },
    chartDisplayPrefix() {
      return this.isEnergyType
        ? this.isYAxisAveragePower
          ? this.chartPowerDisplayPrefix
          : this.chartEnergyDisplayPrefix
        : this.chartPowerDisplayPrefix
    },

    isYAxisAveragePower() {
      return this.chartYAxis === OPTIONS.CHART_YAXIS_AVERAGE_POWER
    },

    powerEnergyDomains() {
      return this.currentDomainPowerEnergy
        ? _cloneDeep(this.currentDomainPowerEnergy).reverse()
        : []
    },
    domains() {
      const property =
        this.fuelTechGroupName === GROUP_DETAILED ? 'fuelTech' : 'group'
      const domains = this.powerEnergyDomains
      const hidden = this.hiddenFuelTechs
      return domains.filter((d) => !_includes(hidden, d[property]))
    },
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
    range() {
      return this.$store.getters.range
    },
    interval() {
      return this.$store.getters.interval
    },

    dataset() {
      if (this.hasCompareData) {
        const change = {}
        const former = this.updatedCompareData[0]
        const latter = this.updatedCompareData[1]
        Object.keys(latter).forEach((d) => {
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
        Object.keys(latter).forEach((d) => {
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
    isReducedDemand() {
      return this.dataset && this.dataset._total < 0
    },
    updatedDomains() {
      const domains = this.domains.slice()
      if (this.isReducedDemand) {
        domains.push({
          colour: 'rgba(203, 87, 58, 0.5)',
          id: '_total',
          label: 'Reduced Demand'
        })
      }
      return domains
    },

    highlightId() {
      const domain = this.highlightDomain
      const property =
        this.fuelTechGroupName === GROUP_DETAILED ? 'fuelTech' : 'group'
      const find = this.domains.find((d) => d[property] === domain)
      return find ? find.id : ''
    }
  },

  watch: {
    compareData() {
      this.updateData()
    }
  },

  mounted() {
    // const $height = this.$el.offsetHeight < 200 ? 200 : this.$el.offsetHeight
    // this.visHeight = $height
  },

  methods: {
    updateData() {
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
    },
    onDragged({ offsetY }) {
      if (this.draggedHeight + offsetY > 50) {
        this.visHeight = this.draggedHeight + offsetY
      } else {
        this.visHeight = 50
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-label {
  text-align: center;
}
.compare-chart-legend {
  display: flex;
  align-items: center;
  border: 1px solid #E0DFDC;
  background-color: white;

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
