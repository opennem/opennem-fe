import { mapGetters } from 'vuex'
import { max } from 'd3-array'
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
      featureEmissions: 'feature/emissions',
      emissionsVolumeUnit: 'si/emissionsVolumeUnit',
      emissionsVolumePrefix: 'si/emissionsVolumePrefix',
      useEVnextPrefix: 'si/useEVnextPrefix',
      fuelTechGroupName: 'fuelTechGroupName',
      dateFilter: 'dateFilter',
      filterPeriod: 'filterPeriod',
      type: 'energyChartType',
      chartUnit: 'chartUnit',
      chartEnergyRenewablesLine: 'visInteract/chartEnergyRenewablesLine',
      chartSummaryPie: 'visInteract/chartSummaryPie',
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
    },

    renewablesMax() {
      let m = max(this.renewablesPercentageDataset, d => d.value)
      return m < 100 ? 100 : m
    },

    energyYMin() {
      const chartEnergyType = this.chartEnergyType
      const chartEnergyYAxis = this.chartEnergyYAxis

      if (chartEnergyType === 'proportion') {
        return 0
      } else if (chartEnergyType === 'line') {
        if (chartEnergyYAxis === 'percentage') {
          return this.getMinValue(this.energyPercentDataset)
        }
        return this.getMinValue(this.dataset)
      }
      return this.energyMin
    },
    energyYMax() {
      const chartEnergyType = this.chartEnergyType
      const chartEnergyYAxis = this.chartEnergyYAxis

      if (chartEnergyType === 'proportion') {
        return 100
      } else if (chartEnergyType === 'line') {
        if (chartEnergyYAxis === 'percentage') {
          return this.getMaxValue(this.energyPercentDataset)
        }
        return this.getMaxValue(this.dataset)
      }
      return this.energyMax
    }
  },
  methods: {
    getMinValue(dataset) {
      let min = 0
      dataset.forEach(d => {
        if (d._lowest < min) {
          min = d._lowest
        }
      })
      return min
    },
    getMaxValue(dataset) {
      let max = 0
      if (this.fuelTechGroupName === 'Default') {
        dataset.forEach(d => {
          if (d._highest > max) {
            max = d._highest
          }
        })
      } else {
        dataset.forEach(d => {
          this.stackedAreaDomains.forEach(domain => {
            if (d[domain.id] > max) {
              max = d[domain.id]
            }
          })
        })
      }
      return max === 0 ? 100 : max
    },
    calculateEnergyEmissionsDatasets() {
      const isGeneration = this.percentContributionTo === 'generation'
      const energyPercentDataset = [],
        energyGrossPercentDataset = [],
        emissionsIntensityDataset = [],
        emissionsVolumeDataset = [],
        renewablesPercentageDataset = []
      let energyMinAll = 0,
        energyMaxAll = 0,
        energyLineMin = 0,
        energyLineMax = 0,
        emissionsMinAll = 0,
        emissionsMaxAll = 0,
        emissionsIntensityMinAll = 0,
        emissionsIntensityMaxAll = 0

      function isNetIds(fuelTech) {
        return (
          fuelTech === 'battery_charging' ||
          fuelTech === 'battery_discharging' ||
          fuelTech === 'hydro' ||
          fuelTech === 'pumps' ||
          fuelTech === 'exports' ||
          fuelTech === 'imports'
        )
      }

      this.dataset.forEach((d, i) => {
        let totalDemand = 0,
          totalGeneration = 0,
          totalNetGeneration = 0,
          totalEmissionsVol = 0,
          energyMin = 0,
          energyMax = 0,
          emissionsMin = 0,
          emissionsMax = 0

        // Energy Percent
        energyPercentDataset.push({
          date: d.date,
          _isIncompleteBucket: d._isIncompleteBucket
        })
        energyGrossPercentDataset.push({
          date: d.date,
          _isIncompleteBucket: d._isIncompleteBucket
        })

        this.stackedAreaDomains.forEach(domain => {
          const id = domain.id
          const ft = domain.fuelTech

          if (domain.category == 'source') {
            if (ft === 'battery_discharging') {
              totalNetGeneration += this.dataset[i]._netBattery
            } else if (ft === 'hydro') {
              totalNetGeneration += this.dataset[i]._netHydro
            } else if (ft === 'imports') {
              totalNetGeneration += this.dataset[i]._netImports
            } else {
              totalNetGeneration += d[id]
            }
          }
        })

        this.stackedAreaDomains.forEach(domain => {
          const id = domain.id
          const ft = domain.fuelTech
          const energyPercent = this.findEnergyPercent(id)

          totalDemand += d[id] || 0
          if (domain.category == 'source' && domain.fuelTech !== 'imports') {
            totalGeneration += d[id] || 0
          }

          if (domain.category == 'source') {
            if (energyPercent) {
              if (ft === 'battery_discharging') {
                energyPercentDataset[i][energyPercent.id] =
                  (d._netBattery / totalNetGeneration) * 100
              } else if (ft === 'hydro') {
                energyPercentDataset[i][energyPercent.id] =
                  (d._netHydro / totalNetGeneration) * 100
              } else if (ft === 'imports') {
                energyPercentDataset[i][energyPercent.id] =
                  (d._netImports / totalNetGeneration) * 100
              } else {
                energyPercentDataset[i][energyPercent.id] =
                  (d[id] / totalNetGeneration) * 100
              }
            }
          }

          energyGrossPercentDataset[i][energyPercent.id] =
            (d[id] / d._total) * 100

          energyMax += d[id] || 0
          if (d[id] < 0) {
            energyMin += d[id] || 0
          }

          if (d[id] < energyLineMin) {
            energyLineMin = d[id]
          }
          if (d[id] > energyLineMax) {
            energyLineMax = d[id]
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

      energyPercentDataset.forEach(p => {
        let min = 0,
          max = 0
        this.stackedEnergyPercentDomains.forEach(domain => {
          const id = domain.id
          if (p[id] < min) {
            min = p[id]
          }
          if (p[id] > max) {
            max = p[id]
          }
        })
        p._lowest = min
        p._highest = max
      })

      energyGrossPercentDataset.forEach(p => {
        let min = 0,
          max = 0
        this.stackedEnergyPercentDomains.forEach(domain => {
          const id = domain.id

          if (domain.category === 'load') {
            p[id] = -p[id]
          }
          if (p[id] < min) {
            min = p[id]
          }
          if (p[id] > max) {
            max = p[id]
          }
        })
        p._lowest = min
        p._highest = max
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
        energyPercentDataset,
        energyGrossPercentDataset,
        emissionsIntensityDataset,
        emissionsVolumeDataset,
        renewablesPercentageDataset,
        energyMinAll,
        energyMaxAll,
        energyLineMin,
        energyLineMax,
        emissionsMinAll,
        emissionsMaxAll,
        emissionsIntensityMinAll,
        emissionsIntensityMaxAll
      }
    },

    setEnergyEmissionsMinMaxDataset(d) {
      this.energyMin = d.energyMinAll
      this.energyMax = d.energyMaxAll
      this.energyLineMin = d.energyLineMin
      this.energyLineMax = d.energyLineMax
      this.emissionsMin = d.emissionsMinAll
      this.emissionsMax = d.emissionsMaxAll
      this.emissionsIntensityDataset = d.emissionsIntensityDataset
      this.emissionsIntensityMin = d.emissionsIntensityMinAll
      this.emissionsIntensityMax = d.emissionsIntensityMaxAll + 100 // add some top padding to the max value for EI chart
      this.emissionsVolumeDataset = d.emissionsVolumeDataset
      this.renewablesPercentageDataset = d.renewablesPercentageDataset
      this.energyPercentDataset = d.energyPercentDataset
      this.energyGrossPercentDataset = d.energyGrossPercentDataset
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
    },

    findEnergyPercent(id) {
      const initId = id.split('.')
      initId.pop()
      let percentId = initId.join('.')
      percentId += '.energy_percent'

      return this.stackedEnergyPercentDomains
        ? this.stackedEnergyPercentDomains.find(p => p.id === percentId)
        : null
    }
  }
}

export default pageEnergyMixin
