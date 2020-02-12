const pageEnergyMixin = {
  filters: {
    intervalLabel(interval) {
      if (interval === 'Fin Year') {
        return 'year'
      }
      return interval.toLowerCase()
    }
  },
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

          if (
            !isGeneration ||
            (isGeneration &&
              domain.fuelTech !== 'imports' &&
              domain.fuelTech !== 'exports')
          ) {
            totalEmissionsVol += d[id] || 0
            emissionsMax += d[id] || 0

            if (d[id] < 0) {
              emissionsMin += d[id] || 0
            }

            emissionsVolumeDataset[lastEVIndex][id] = d[id]
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

      this.energyMin = energyMinAll
      this.energyMax = energyMaxAll
      this.emissionsMin = emissionsMinAll
      this.emissionsMax = emissionsMaxAll
      this.emissionsIntensityDataset = emissionsIntensityDataset
      this.emissionsIntensityMin = emissionsIntensityMinAll
      this.emissionsIntensityMax = emissionsIntensityMaxAll
      this.emissionsVolumeDataset = emissionsVolumeDataset
    }
  }
}

export default pageEnergyMixin
