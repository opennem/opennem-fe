<template>
  <header>
    <section class="export-buttons">
      <div class="export-buttons-wrapper">
        <h1>Export as Image (PNG)</h1>
        <div>
          <button
            class="cancel-button button is-small is-rounded is-primary is-inverted"
            @click="handleCancelClick">Cancel</button>
          <button
            class="button is-small is-rounded is-primary"
            @click="handleExportClick">Download</button>
        </div>
      </div>
    </section>
    <section class="widget-buttons">
      <div>
        <a
          v-for="chart in chartButtons"
          :key="chart.name"
          :class="{ 'is-primary': isEnabled(chart.name) }"
          class="tag is-rounded is-white"
          @click="handleWidgetToggle(chart.name)">
          {{ chart.name === 'chartEnergy' ? getChartEnergyLabel(chart.label) : chart.label }}
        </a>
        <hr>
        <a
          v-for="table in tables"
          :key="table.name"
          :class="{ 'is-primary': isEnabled(table.name) }"
          class="tag is-rounded is-white"
          @click="handleWidgetToggle(table.name)">
          {{ table.label }}
        </a>
      </div>
    </section>
  </header>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: () => ''
    },
    charts: {
      type: Array,
      default: () => []
    },
    tables: {
      type: Array,
      default: () => []
    },
    featureEmissions: {
      type: Boolean,
      default: () => false
    },
    hasEmissions: {
      type: Boolean,
      default: () => false
    },
    hasPrice: {
      type: Boolean,
      default: () => false
    },
    hasTemperature: {
      type: Boolean,
      default: () => false
    },
    chartEnergy: {
      type: Boolean,
      default: () => false
    },
    chartEmissionsVolume: {
      type: Boolean,
      default: () => false
    },
    chartEmissionsIntensity: {
      type: Boolean,
      default: () => false
    },
    chartPrice: {
      type: Boolean,
      default: () => false
    },
    chartTemperature: {
      type: Boolean,
      default: () => false
    },
    summary: {
      type: Boolean,
      default: () => false
    },
    legend: {
      type: Boolean,
      default: () => false
    }
  },

  computed: {
    chartButtons() {
      return this.charts.filter(
        c =>
          (this.hasEmissions && this.featureEmissions
            ? true
            : c.name !== 'chartEmissionsVolume' &&
              c.name !== 'chartEmissionsIntensity') &&
          (this.hasTemperature ? true : c.name !== 'chartTemperature') &&
          (this.hasPrice ? true : c.name !== 'chartPrice')
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

    handleWidgetToggle(widgetName) {
      this.$emit('widgetToggle', widgetName)
    },

    getChartEnergyLabel(chartLabel) {
      return this.type === 'power' ? 'Generation' : chartLabel
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
