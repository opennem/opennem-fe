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
      emissionsVolumeUnit: 'si/emissionsVolumeUnit',
      emissionsVolumePrefix: 'si/emissionsVolumePrefix'
    })
  },
  methods: {
    updateYMinMax() {
      const isGeneration = this.percentContributionTo === 'generation'
      const emissionsIntensityDataset = [],
        emissionsVolumeDataset = []
      let energyMinAll = 0,
        energyMaxAll = 0,
        emissionsMinAll = 0,
        emissionsMaxAll = 0,
        emissionsIntensityMinAll = 0,
        emissionsIntensityMaxAll = 1200

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
      })

      // duplicate last valid EV value to render the step line correctly
      const evDatasetLength = emissionsIntensityDataset.length
      const lastValidEI =
        emissionsIntensityDataset[evDatasetLength - 2]._emissionsIntensity
      emissionsIntensityDataset[
        evDatasetLength - 1
      ]._emissionsIntensity = lastValidEI

      // update values
      function updateEmissionsVolume(prefix, that) {
        that.$store.dispatch('si/emissionsVolumePrefix', prefix)
        emissionsVolumeDataset.forEach(d => {
          that.emissionStackedAreaDomains.forEach(domain => {
            d[domain.id] = Data.siCalculation(
              that.emissionsVolumePrefix,
              d[domain.id]
            )
          })
        })
        emissionsMaxAll = Data.siCalculation(
          that.emissionsVolumePrefix,
          emissionsMaxAll
        )
        emissionsMinAll = Data.siCalculation(
          that.emissionsVolumePrefix,
          emissionsMinAll
        )
      }

      if (emissionsMaxAll >= Math.pow(10, 14)) {
        updateEmissionsVolume('T', this)
      } else if (emissionsMaxAll >= Math.pow(10, 11)) {
        updateEmissionsVolume('G', this)
      } else if (emissionsMaxAll >= Math.pow(10, 8)) {
        updateEmissionsVolume('M', this)
      } else if (emissionsMaxAll >= Math.pow(10, 5)) {
        updateEmissionsVolume('k', this)
      } else {
        this.$store.dispatch('si/emissionsVolumePrefix', '')
      }

      this.energyMin = energyMinAll
      this.energyMax = energyMaxAll
      this.emissionsMin = emissionsMinAll
      this.emissionsMax = emissionsMaxAll
      this.emissionsIntensityDataset = emissionsIntensityDataset
      this.emissionsIntensityMin = emissionsIntensityMinAll
      this.emissionsIntensityMax = emissionsIntensityMaxAll + 100 // add some top padding to the max value for EI chart
      this.emissionsVolumeDataset = emissionsVolumeDataset
    }
  }
}

export default pageEnergyMixin
