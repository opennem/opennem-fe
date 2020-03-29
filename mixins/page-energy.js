import { mapGetters } from 'vuex'
import Data from '~/services/Data.js'

const pageEnergyMixin = {
  created() {
    const host = window.location.host
    if (host === 'localhost:3000') {
      this.$store.dispatch('hostEnv', 'local')
    }
    if (host === 'opennem.org.au') {
      this.$store.dispatch('hostEnv', 'prod')
    }
    if (host === 'dev.opennem.org.au') {
      this.$store.dispatch('hostEnv', 'dev')
    }
  },
  computed: {
    ...mapGetters({
      hostEnv: 'hostEnv',
      featureEmissions: 'featureEmissions',
      emissionsVolumeUnit: 'si/emissionsVolumeUnit',
      emissionsVolumePrefix: 'si/emissionsVolumePrefix',
      useEVnextPrefix: 'si/useEVnextPrefix',
      fuelTechGroupName: 'fuelTechGroupName',
      dateFilter: 'dateFilter',
      filterPeriod: 'filterPeriod',
      type: 'energyChartType',
      chartUnit: 'chartUnit',
      chartEnergy: 'chartEnergy',
      chartEmissionsVolume: 'chartEmissionsVolume',
      chartEmissionsIntensity: 'chartEmissionsIntensity',
      chartEnergyRenewablesLine: 'chartEnergyRenewablesLine',
      chartPrice: 'chartPrice',
      chartTemperature: 'chartTemperature',
      chartSummaryPie: 'chartSummaryPie',
      compareDifference: 'compareDifference',
      focusOn: 'focusOn',
      compareDates: 'compareDates',
      responsiveBreakWidth: 'responsiveBreakWidth',
      range: 'range',
      interval: 'interval',
      fuelTechOrder: 'fuelTechOrder',
      fuelTechGroup: 'fuelTechGroup',
      hiddenFuelTechs: 'hiddenFuelTechs',
      percentContributionTo: 'percentContributionTo',
      energyCurveType: 'energyCurveType',
      step: 'step'
    }),

    renewablesLineColour() {
      return this.fuelTechGroupName === 'Renewable/Fossil' ||
        this.fuelTechGroupName === 'Flexibility'
        ? '#e34a33'
        : '#52BCA3'
    }
  },
  methods: {
    calculateEnergyEmissionsDatasets() {
      const isGeneration = this.percentContributionTo === 'generation'
      const emissionsIntensityDataset = [],
        emissionsVolumeDataset = [],
        renewablesPercentageDataset = []
      let energyMinAll = 0,
        energyMaxAll = 0,
        emissionsMinAll = 0,
        emissionsMaxAll = 0,
        emissionsIntensityMinAll = 0,
        emissionsIntensityMaxAll = 0

      this.dataset.forEach((d, i) => {
        let totalDemand = 0,
          totalGeneration = 0,
          totalEmissionsVol = 0,
          energyMin = 0,
          energyMax = 0,
          emissionsMin = 0,
          emissionsMax = 0

        this.stackedAreaDomains.forEach(domain => {
          const id = domain.id
          totalDemand += d[id] || 0
          if (domain.category == 'source' && domain.fuelTech !== 'imports') {
            totalGeneration += d[id] || 0
          }
          energyMax += d[id] || 0
          if (d[id] < 0) {
            energyMin += d[id] || 0
          }
        })

        if (energyMax > energyMaxAll) {
          energyMaxAll = energyMax
        }
        if (energyMin < energyMinAll) {
          energyMinAll = energyMin
        }

        emissionsVolumeDataset.push({
          date: d.date
        })
        const lastEVIndex = emissionsVolumeDataset.length - 1

        this.emissionStackedAreaDomains.forEach(domain => {
          const id = domain.id
          const updatedEVValue = d[id]
          if (
            !isGeneration ||
            (isGeneration &&
              id.indexOf('imports') === -1 &&
              id.indexOf('exports') === -1)
          ) {
            totalEmissionsVol += updatedEVValue || 0
            emissionsMax += updatedEVValue || 0

            if (updatedEVValue < 0) {
              emissionsMin += updatedEVValue || 0
            }

            emissionsVolumeDataset[lastEVIndex][id] = updatedEVValue
          }
        })

        if (emissionsMax > emissionsMaxAll) {
          emissionsMaxAll = emissionsMax
        }
        if (emissionsMin < emissionsMinAll) {
          emissionsMinAll = emissionsMin
        }

        let ei = isGeneration
          ? totalEmissionsVol / totalGeneration
          : totalEmissionsVol / totalDemand
        if (this.interval === 'Year' || this.interval === 'Fin Year') {
          ei = ei / 1000
        }
        const isValidEI = Number.isFinite(ei)
        if (isValidEI && ei > emissionsIntensityMaxAll) {
          emissionsIntensityMaxAll = ei
        }
        if (isValidEI && ei < emissionsIntensityMinAll) {
          emissionsIntensityMinAll = ei
        }
        emissionsIntensityDataset.push({
          date: d.date,
          _emissionsIntensity: isValidEI ? ei : null
        })

        // get renewables dataset
        renewablesPercentageDataset.push({
          date: d.date,
          renewables: d._totalRenewables,
          value: isGeneration
            ? d._totalGenerationRenewablesPercentage
            : d._totalDemandRenewablesPercentage
        })
      })
      if (this.interval !== '5m' && this.interval !== '30m') {
        renewablesPercentageDataset.pop()
      }

      // duplicate last valid EV value to render the step line correctly
      const evDatasetLength = emissionsIntensityDataset.length
      const lastValidEI =
        emissionsIntensityDataset[evDatasetLength - 2]._emissionsIntensity
      emissionsIntensityDataset[
        evDatasetLength - 1
      ]._emissionsIntensity = lastValidEI

      return {
        emissionsIntensityDataset,
        emissionsVolumeDataset,
        renewablesPercentageDataset,
        energyMinAll,
        energyMaxAll,
        emissionsMinAll,
        emissionsMaxAll,
        emissionsIntensityMinAll,
        emissionsIntensityMaxAll
      }
    },

    setEnergyEmissionsMinMaxDataset(d) {
      this.energyMin = d.energyMinAll
      this.energyMax = d.energyMaxAll
      this.emissionsMin = d.emissionsMinAll
      this.emissionsMax = d.emissionsMaxAll
      this.emissionsIntensityDataset = d.emissionsIntensityDataset
      this.emissionsIntensityMin = d.emissionsIntensityMinAll
      this.emissionsIntensityMax = d.emissionsIntensityMaxAll + 100 // add some top padding to the max value for EI chart
      this.emissionsVolumeDataset = d.emissionsVolumeDataset
      this.renewablesPercentageDataset = d.renewablesPercentageDataset
    },

    updateEmissionsVolumeDatasetMinMax(cal) {
      cal.emissionsVolumeDataset.forEach(d => {
        this.emissionStackedAreaDomains.forEach(domain => {
          d[domain.id] = Data.siCalculationFromBase(
            this.emissionsVolumePrefix,
            d[domain.id]
          )
        })
      })
      cal.emissionsMaxAll = Data.siCalculationFromBase(
        this.emissionsVolumePrefix,
        cal.emissionsMaxAll
      )
      cal.emissionsMinAll = Data.siCalculationFromBase(
        this.emissionsVolumePrefix,
        cal.emissionsMinAll
      )
    },

    updateYMinMax() {
      const cal = this.calculateEnergyEmissionsDatasets()

      // update values
      function updateEmissionsVolume(prefix, that) {
        that.$store.dispatch('si/emissionsVolumePrefix', prefix)
        that.$store.dispatch('si/useEVnextPrefix', false)
        that.updateEmissionsVolumeDatasetMinMax(cal)
      }

      if (cal.emissionsMaxAll >= Math.pow(10, 14)) {
        updateEmissionsVolume('T', this)
      } else if (cal.emissionsMaxAll >= Math.pow(10, 11)) {
        updateEmissionsVolume('G', this)
      } else if (cal.emissionsMaxAll >= Math.pow(10, 8)) {
        updateEmissionsVolume('M', this)
      } else if (cal.emissionsMaxAll >= Math.pow(10, 5)) {
        updateEmissionsVolume('k', this)
      } else {
        this.$store.dispatch('si/emissionsVolumePrefix', '')
      }

      this.setEnergyEmissionsMinMaxDataset(cal)
    },

    recalculateAfterPrefixChanged() {
      const cal = this.calculateEnergyEmissionsDatasets()

      // update values
      this.updateEmissionsVolumeDatasetMinMax(cal)
      this.setEnergyEmissionsMinMaxDataset(cal)
    }
  }
}

export default pageEnergyMixin
