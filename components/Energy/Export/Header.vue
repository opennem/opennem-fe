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
          {{ chart.name === 'chartOptionsPowerEnergy' ? getPowerEnergyChartLabel(chart.label) : chart.label }}
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
import { CHART_HIDDEN } from '@/constants/v2/chart-options'

const charts = [
  {
    name: 'chartOptionsPowerEnergy',
    defaultType: 'chartDefaultTypePowerEnergy',
    label: 'Energy'
  },
  {
    name: 'chartOptionsEmissionsVolume',
    defaultType: 'chartDefaultTypeEmissionsVolume',
    label: 'Emissions Volume'
  },
  {
    name: 'chartOptionsEmissionIntensity',
    defaultType: 'chartDefaultTypeEmissionIntensity',
    label: 'Emissions Intensity'
  },
  {
    name: 'chartOptionsPrice',
    defaultType: 'chartDefaultTypePrice',
    label: 'Price'
  },
  {
    name: 'chartOptionsTemperature',
    defaultType: 'chartDefaultTypeTemperature',
    label: 'Temperature'
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
      tables
    }
  },

  computed: {
    ...mapGetters({
      ready: 'regionEnergy/ready',
      isEnergyType: 'regionEnergy/isEnergyType',
      domainPrice: 'regionEnergy/domainPrice',
      domainTemperature: 'regionEnergy/domainTemperature',
      currentDomainEmissions: 'regionEnergy/currentDomainEmissions',
      chartOptionsPowerEnergy: 'chartOptionsPowerEnergy/chartShown',
      chartOptionsEmissionsVolume: 'chartOptionsEmissionsVolume/chartShown',
      chartOptionsEmissionIntensity: 'chartOptionsEmissionIntensity/chartShown',
      chartOptionsPrice: 'chartOptionsPrice/chartShown',
      chartOptionsTemperature: 'chartOptionsTemperature/chartShown',
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
            : c.name !== 'chartOptionsEmissionsVolume' &&
              c.name !== 'chartOptionsEmissionIntensity') &&
          (this.hasTemperature ? true : c.name !== 'chartOptionsTemperature') &&
          (this.hasPrice ? true : c.name !== 'chartOptionsPrice')
      )
    }
  },

  methods: {
    isEnabled(widgetName) {
      return this[widgetName]
    },

    handleCancelClick() {
      this.$emit('exportCancel')
    },

    handleExportClick() {
      this.$emit('exportClick')
    },

    handleChartToggle(chart) {
      const name = chart.name
      if (this[name]) {
        this.$store.commit(`${name}/chartType`, CHART_HIDDEN)
      } else {
        this.$store.commit(`${name}/chartType`, this[chart.defaultType])
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
