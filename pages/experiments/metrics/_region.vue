<template>
  <div class="container-fluid">
    <div class="options">
      <label for="">Period</label>
      <div class="select is-rounded">
        <select v-model="selectedPeriod">
          <option
            v-for="(d, i) in periods"
            :key="`period-${i}`"
            :value="d.value"
          >
            {{ d.label }}
          </option>
        </select>
      </div>

      <label for="">Metric</label>
      <div class="select is-rounded">
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
      v-if="statesData.length > 0"
      :svg-height="30"
      :unit="selectedMetricObject.unit"
      :multiplier="selectedMetricObject.divisor"
      :colour-range="selectedMetricObject.range"
      :colour-domain="selectedMetricObject.domain"
      class="colour-legend"
    />

    <section
      v-for="(d, i) in statesData"
      :key="`state-${i}`"
      class="vis-section"
    >
      <h4>{{ d.region }}</h4>

      <div v-if="d.yearlyData">
        <section
          v-for="(yData, yIndex) in d.yearlyData"
          :key="`yearly-${i}-${yIndex}`"
        >
          <h5>{{ yData.year }}</h5>
          <Heatmap
            :cell-width="3"
            :cell-height="50"
            :svg-height="50"
            :radius="0"
            :dataset="yData[selectedMetric]"
            :value-prop="selectedMetric"
            :divisor="selectedMetricObject.divisor"
            :colour-range="selectedMetricObject.range"
            :colour-domain="selectedMetricObject.domain"
          />
        </section>
      </div>
      <div v-else>
        <Heatmap
          :cell-width="5"
          :cell-height="75"
          :svg-height="75"
          :radius="0"
          :dataset="d[selectedMetric]"
          :value-prop="selectedMetric"
          :divisor="selectedMetricObject.divisor"
          :colour-range="selectedMetricObject.range"
          :colour-domain="selectedMetricObject.domain"
        />
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getEnergyRegions } from '@/constants/energy-regions.js'
import { periods, metrics, years } from '@/constants/metrics/'
import Heatmap from '@/components/Vis/_wip/Heatmap'
import ColourLegend from '@/components/Vis/ColourLegend'

export default {
  layout: 'main',

  components: {
    Heatmap,
    ColourLegend
  },

  head: {
    titleTemplate: 'OpenNEM Experiments: Metrics'
  },

  data() {
    return {
      periods,
      metrics,
      years,
      statesData: [],
      regions: getEnergyRegions().filter(
        d => d.id !== 'all' && d.id !== 'nem' && d.id !== 'wem'
      )
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName'
    }),

    selectedPeriod: {
      get() {
        return this.$store.getters['metrics/selectedPeriod']
      },

      set(val) {
        this.$store.commit('metrics/selectedPeriod', val)
      }
    },

    selectedMetric: {
      get() {
        return this.$store.getters['metrics/selectedMetric']
      },

      set(val) {
        this.$store.commit('metrics/selectedMetric', val)
      }
    },

    selectedMetricObject() {
      return this.metrics.find(m => m.value === this.selectedMetric)
    },

    regionId() {
      return this.$route.params.region
    }
  },

  watch: {
    regionId(id) {
      this.getData(id, this.selectedPeriod)
    },
    selectedPeriod(period) {
      this.getData(this.regionId, period)
    }
  },

  mounted() {
    this.$store.dispatch('currentView', 'experiments/metrics')
    this.getData(this.regionId, this.selectedPeriod)
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'regionEnergy/doGetRegionData',
      doGetYearRegionData: 'regionEnergy/doGetYearRegionData'
    }),

    getData(id, period) {
      // reset
      this.yearlyData = []
      this.statesData = []

      const filter =
        id === 'all'
          ? d => d.id !== 'all' && d.id !== 'nem'
          : id === 'nem'
            ? d => d.id !== 'all' && d.id !== 'nem' && d.id !== 'wem'
            : d => d.id === id
      const regions = getEnergyRegions().filter(filter)

      if (period === 'all/month') {
        this.getRegionsData(regions)
      } else if (period === 'multiyear/day') {
        regions.forEach((r, i) => {
          const yearlyData = []
          years.forEach((year, yIndex) => {
            setTimeout(() => {
              this.doGetYearRegionData({ region: r.id, year }).then(d => {
                const propData = this.getProportionsDataset(
                  d.dataset,
                  d.domainPowerEnergy
                )
                yearlyData.push({
                  year,
                  carbonIntensity: this.getEmissionIntensityDataset(
                    d.dataset,
                    d.domainPowerEnergy,
                    d.domainEmissions
                  ),
                  renewablesProportion: propData,
                  gasProportion: propData,
                  coalProportion: propData
                })
              })
            }, 200 * yIndex)
          })

          this.statesData.push({
            region: r.label,
            yearlyData
          })
        })
      }
    },

    getRegionsData(regions) {
      regions.forEach((r, i) => {
        setTimeout(() => {
          this.doGetRegionData({
            region: r.id,
            range: 'ALL',
            interval: 'Month',
            period: 'All',
            groupName: this.fuelTechGroupName
          }).then(d => {
            const propData = this.getProportionsDataset(
              d.currentDataset,
              d.currentDomainPowerEnergy
            )

            this.statesData.push({
              region: r.label,
              carbonIntensity: this.getEmissionIntensityDataset(
                d.currentDataset,
                d.currentDomainPowerEnergy,
                d.currentDomainEmissions
              ),
              renewablesProportion: propData,
              gasProportion: propData,
              coalProportion: propData
            })
          })
        }, 500 * i)
      })
    },

    getProportionsDataset(data, domains) {
      return data.map(d => {
        const obj = {
          date: d.date,
          time: d.time,
          renewablesProportion:
            d._totalDemandRenewablesPercentage > 100
              ? 100
              : d._totalDemandRenewablesPercentage,
          coalProportion:
            d._totalDemandCoalProportion < 0 ? 0 : d._totalDemandCoalProportion,
          coal: d._totalCoal,
          gasProportion:
            d._totalDemandGasProportion < 0 ? 0 : d._totalDemandGasProportion,
          gas: d._totalGas
        }
        return obj
      })
    },

    getEmissionIntensityDataset(
      currentDataset,
      currentDomainPowerEnergy,
      currentDomainEmissions
    ) {
      return currentDataset.map(d => {
        const obj = {
          date: d.date,
          time: d.time,
          _isIncompleteBucket: d._isIncompleteBucket
        }
        let totalEmissions = 0,
          totalPowerEnergy = 0
        currentDomainEmissions.forEach(domain => {
          totalEmissions += d[domain.id] || 0
        })
        currentDomainPowerEnergy.forEach(domain => {
          if (domain.category !== 'load' || domain.fuelTech === 'exports') {
            totalPowerEnergy += d[domain.id] || 0
          }
        })
        obj._totalEmissions = totalEmissions
        obj._totalPowerEnergy = totalPowerEnergy

        let ei = totalEmissions / totalPowerEnergy
        const isValidEI = Number.isFinite(ei)

        obj.carbonIntensity = isValidEI ? ei : null
        return obj
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.container-fluid {
  padding: 1rem 4rem;
}
.options {
  display: flex;
  align-items: center;

  & > * {
    margin: 0 1rem;
  }

  label {
    margin: 0 0.5rem;
  }
}
.vis-section {
  margin-top: 1rem;
  position: relative;
  h4 {
    font-family: $header-font-family;
    font-size: 1.6em;
    font-weight: 700;
  }
  h5 {
    font-family: $header-font-family;
    font-weight: 700;
    font-size: 1.2em;
    position: absolute;
    color: #fff;
    left: 5px;
    text-shadow: 0 1px 1px #000;
  }
}
.colour-legend {
  margin-top: 2rem;
}
</style>
