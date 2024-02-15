<template>
  <header>
    <section class="export-buttons">
      <div class="export-buttons-wrapper">
        <h1>Export as Image (PNG)</h1>
        <div v-if="ready">
          <button
            class="cancel-button button is-small is-rounded is-primary is-inverted"
            @click="handleCancelClick"
          >
            Cancel
          </button>
          <button
            class="button is-small is-rounded is-primary"
            @click="handleExportClick"
          >
            Download
          </button>
        </div>
      </div>
    </section>
    <section 
      v-show="ready" 
      class="widget-buttons"
    >
      <div>
        <a
          v-for="chart in chartButtons"
          :key="chart.name"
          :class="{ 'is-primary': isEnabled(chart.name) }"
          class="tag is-rounded is-white"
          @click="handleChartToggle(chart)"
        >
          {{
            chart.name === 'exportPowerEnergy'
              ? getPowerEnergyChartLabel(chart.label)
              : chart.label
          }}
        </a>
        <hr >

        <div :class="{ disabled: !hasGenerationOrEmissionsVolumeSelected }">
          <span class="tag-group">
            <a
              v-for="table in tables"
              :key="table.name"
              :class="{ 'is-primary': isEnabled(table.name) }"
              class="tag is-rounded is-white"
              @click="handleTableToggle(table.name)"
            >
              {{ table.label }}
            </a>
          </span>

          <a
            v-if="legend"
            :class="{ 'is-primary': percentDisplay }"
            class="tag is-rounded is-white"
            @click="handlePercentDisplay()"
          >
            Show %
          </a>
        </div>

        
      </div>
    </section>
  </header>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { lsGet, lsSet } from '@/services/LocalStorage'

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
    },
    percentDisplay: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
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

      exportCharts: 'export/charts',
      exportPowerEnergy: 'export/powerEnergy',
      exportEmissionsVolume: 'export/emissionsVolume',
      exportEmissionIntensity: 'export/emissionIntensity',
      exportPrice: 'export/price',
      exportTemperature: 'export/temperature',
      hasGenerationOrEmissionsVolumeSelected: 'export/hasGenerationOrEmissionsVolumeSelected'
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
      return this.exportCharts.filter(
        (c) =>
          (this.hasEmissions
            ? true
            : c.name !== 'exportEmissionsVolume' &&
              c.name !== 'exportEmissionIntensity') &&
          (this.hasTemperature ? true : c.name !== 'exportTemperature') &&
          (this.hasPrice ? true : c.name !== 'exportPrice')
      )
    }
  },

  created() {
    this.exportCharts.forEach((c) => {
      let localState = lsGet(c.name)
      let state = localState && localState !== 'false' ? true : false
      if (c.name === 'exportPowerEnergy' && localState === null) {
        state = true
      }
      this.$store.commit(`export/${c.commit}`, state)
    })
  },

  methods: {
    ...mapMutations({
      setExportPowerEnergy: 'export/powerEnergy',
      setExportEmissionsVolume: 'export/emissionsVolume',
      setExportEmissionIntensity: 'export/emissionIntensity',
      setExportPrice: 'export/price',
      setExportTemperature: 'export/temperature'
    }),

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
      this.$store.commit(`export/${chart.commit}`, !this[chart.name])
    },

    handleTableToggle(table) {
      this.$emit('tableToggle', table)
    },

    handlePercentDisplay() {
      this.$emit('percentDisplayToggle')
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

  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  a.tag {
    text-decoration: none;
    user-select: none;
    margin-right: 0.5rem;
  }

  .tag-group {
    margin-right: 0.5rem;
    .tag {
      border-radius: 0;
      margin-right: 0;
    }
    .tag:first-child {
      border-radius: 10px 0 0 10px;
    }
    .tag:last-child {
      border-radius: 0 10px 10px 0;
    }
  }
}


</style>
