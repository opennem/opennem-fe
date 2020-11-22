<template>
  <div class="">
    <AppLogo class="logo" />

    <h5>Legend (0 - 1000)</h5>
    <HeatColumns
      :id="'legend'"
      :cell-width="20"
      :cell-height="20"
      :dataset="[
        { value: 0 },
        { value: 100 },
        { value: 200 },
        { value: 300 },
        { value: 400 },
        { value: 500 },
        { value: 600 },
        { value: 700 },
        { value: 800 },
        { value: 900 },
        { value: 1000 }
      ]"
      :value-prop="'value'"
    />
    <section 
      v-for="(d, i) in statesData" 
      :key="`state-${i}`">
      <h5>{{ d.region }}</h5>
      <HeatColumns
        :cell-width="5"
        :cell-height="75"
        :svg-height="75"
        :radius="0"
        :id="`state-${i}`"
        :dataset="d.data"
        :value-prop="'_emissionIntensity'"
      />
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getEnergyRegions } from '@/constants/energy-regions.js'
import AppLogo from '~/components/ui/Logo'
import HeatColumns from '@/components/Vis/_wip/HeatColumns'

export default {
  components: {
    AppLogo,
    HeatColumns
  },

  head: {
    titleTemplate: 'OpenNEM Experiments'
  },

  data() {
    return {
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
    })
  },

  mounted() {
    this.regions.forEach((r, i) => {
      setTimeout(() => {
        this.doGetRegionData({
          region: r.id,
          range: 'ALL',
          interval: 'Month',
          period: 'All',
          groupName: this.fuelTechGroupName
        }).then(d => {
          this.statesData.push({
            region: r.label,
            data: this.getEmissionIntensityDataset(
              d.currentDataset,
              d.currentDomainPowerEnergy,
              d.currentDomainEmissions
            )
          })
        })
      }, 1000 * i)
    })
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'regionEnergy/doGetRegionData'
    }),

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

        obj._emissionIntensity = isValidEI ? ei : null
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
  margin-top: 1rem;
}
::v-deep .logo img {
  max-height: 50px;
}
</style>
