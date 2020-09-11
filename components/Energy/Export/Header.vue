<template>
  <header>
    <section class="export-buttons">
      <div class="export-buttons-wrapper">
        <h1>Export as Image (PNG)</h1>
        <div v-if="ready">
          <button
            class="cancel-button button is-small is-rounded is-primary is-inverted"
            @click="handleCancelClick">Cancel</button>
          <button
            class="button is-small is-rounded is-primary"
            @click="handleExportClick">Download</button>
        </div>
      </div>
    </section>
    <section 
      v-if="ready" 
      class="widget-buttons">
      <div>
        <a
          v-for="chart in chartButtons"
          :key="chart.name"
          :class="{ 'is-primary': isEnabled(chart.name) }"
          class="tag is-rounded is-white"
          @click="handleChartToggle(chart)">
          {{ chart.name === 'chartShownPowerEnergy' ? getPowerEnergyChartLabel(chart.label) : chart.label }}
        </a>
        <hr>
        <a
          v-for="table in tables"
          :key="table.name"
          :class="{ 'is-primary': isEnabled(table.name) }"
          class="tag is-rounded is-white"
          @click="handleTableToggle(table.name)">
          {{ table.label }}
        </a>
      </div>
    </section>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import { CHART_HIDDEN } from '@/constants/chart-options'

const charts = [
  {
    name: 'chartShownPowerEnergy',
    currentType: 'chartTypePowerEnergy',
    defaultType: 'chartDefaultTypePowerEnergy',
    label: 'Energy',
    commit: 'chartOptionsPowerEnergy'
  },
  {
    name: 'chartShownEmissionsVolume',
    currentType: 'chartTypeEmissionsVolume',
    defaultType: 'chartDefaultTypeEmissionsVolume',
    label: 'Emissions Volume',
    commit: 'chartOptionsEmissionsVolume'
  },
  {
    name: 'chartShownEmissionIntensity',
    currentType: 'chartTypeEmissionIntensity',
    defaultType: 'chartDefaultTypeEmissionIntensity',
    label: 'Emissions Intensity',
    commit: 'chartOptionsEmissionIntensity'
  },
  {
    name: 'chartShownPrice',
    currentType: 'chartTypePrice',
    defaultType: 'chartDefaultTypePrice',
    label: 'Price',
    commit: 'chartOptionsPrice'
  },
  {
    name: 'chartShownTemperature',
    currentType: 'chartTypeTemperature',
    defaultType: 'chartDefaultTypeTemperature',
    label: 'Temperature',
    commit: 'chartOptionsTemperature'
  }
]
const tables = [
  {
    name: 'legend',
    label: 'Legend'
  },
  {
    name: 'summary',
    label: 'Summary'
  }
]
export default {
  props: {
    summary: {
      type: Boolean,
      default: () => false
    },
    legend: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      charts,
      tables,
      previousChartStates: {}
    }
  },

  computed: {
    ...mapGetters({
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      domainPrice: 'regionEnergy/domainPrice',
      domainTemperature: 'regionEnergy/domainTemperature',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',
      chartShownPowerEnergy: 'chartOptionsPowerEnergy/chartShown',
      chartShownEmissionsVolume: 'chartOptionsEmissionsVolume/chartShown',
      chartShownEmissionIntensity: 'chartOptionsEmissionIntensity/chartShown',
      chartShownPrice: 'chartOptionsPrice/chartShown',
      chartShownTemperature: 'chartOptionsTemperature/chartShown',
      chartTypePowerEnergy: 'chartOptionsPowerEnergy/chartType',
      chartTypeEmissionsVolume: 'chartOptionsEmissionsVolume/chartType',
      chartTypeEmissionIntensity: 'chartOptionsEmissionIntensity/chartType',
      chartTypePrice: 'chartOptionsPrice/chartType',
      chartTypeTemperature: 'chartOptionsTemperature/chartType',
      chartDefaultTypePowerEnergy: 'chartOptionsPowerEnergy/chartDefaultType',
      chartDefaultTypeEmissionsVolume:
        'chartOptionsEmissionsVolume/chartDefaultType',
      chartDefaultTypeEmissionIntensity:
        'chartOptionsEmissionIntensity/chartDefaultType',
      chartDefaultTypePrice: 'chartOptionsPrice/chartDefaultType',
      chartDefaultTypeTemperature: 'chartOptionsTemperature/chartDefaultType',
      featureEmissions: 'feature/emissions'
    }),
    hasEmissions() {
      return this.currentDomainEmissions.length > 0
    },
    hasPrice() {
      return this.domainPrice.length > 0
    },
    hasTemperature() {
      return this.domainTemperature.length > 0
    },
    chartButtons() {
      return this.charts.filter(
        c =>
          (this.hasEmissions && this.featureEmissions
            ? true
            : c.name !== 'chartShownEmissionsVolume' &&
              c.name !== 'chartShownEmissionIntensity') &&
          (this.hasTemperature ? true : c.name !== 'chartShownTemperature') &&
          (this.hasPrice ? true : c.name !== 'chartShownPrice')
      )
    }
  },

  mounted() {
    this.charts.forEach(c => {
      this.previousChartStates[c.name] = this[c.currentType]
    })
  },

  methods: {
    isEnabled(widgetName) {
      return this[widgetName]
    },

    restorePreviousChartStates() {
      this.charts.forEach(c => {
        this.$store.commit(
          `${c.commit}/chartType`,
          this.previousChartStates[c.name]
        )
      })
    },

    handleCancelClick() {
      this.$emit('exportCancel')
      this.restorePreviousChartStates()
    },

    handleExportClick() {
      this.$emit('exportClick')
    },

    handleChartToggle(chart) {
      if (this[chart.name]) {
        this.$store.commit(`${chart.commit}/chartType`, CHART_HIDDEN)
      } else {
        if (this.previousChartStates[chart.name] === CHART_HIDDEN) {
          // if previous state is hidden, use default chart type
          this.$store.commit(
            `${chart.commit}/chartType`,
            this[chart.defaultType]
          )
        } else {
          this.$store.commit(
            `${chart.commit}/chartType`,
            this.previousChartStates[chart.name]
          )
        }
      }
    },

    handleTableToggle(table) {
      this.$emit('tableToggle', table)
    },

    getPowerEnergyChartLabel(chartLabel) {
      return this.isEnergyType ? chartLabel : 'Generation'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
hr {
  margin: 0.3rem 0;
  border-bottom: 1px solid #dedede;
}
header {
  margin-top: 5rem;
}
.export-buttons {
  margin-bottom: 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9;
  background-color: $beige-lighter;
  padding: 1rem;
  border-bottom: 1px solid #ddd;

  .export-buttons-wrapper {
    max-width: 640px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cancel-button {
    margin-right: 0.5rem;
  }
}
.widget-buttons {
  background-color: rgba(255, 255, 255, 0.5);
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 0.5rem;

  a.tag {
    text-decoration: none;
    user-select: none;
    margin-right: 0.5rem;
  }
}
</style>
