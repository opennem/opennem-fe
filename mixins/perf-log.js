const perfLogMixin = {
  methods: {
    getPerfLabel() {
      let processLength = 0,
        arrayLength = 0,
        downToLength = this.dataset.length
      try {
        if (this.responses.length > 0 && this.responses[0].data) {
          arrayLength = this.responses[0].data.length
          this.responses[0].data.forEach(d => {
            processLength += d.history.data.length
            if (d.forecast) {
              processLength += d.forecast.data.length
            }
          })
        }
      } catch (e) {
        console.error('A problem getting response data lengths')
      }
      return `${this.regionId} — ${this.range}/${
        this.interval
      } (crunched ${processLength} points down to ${downToLength} points)`
    },

    getGroupPerfLabel() {
      const group = this.fuelTechGroupName || 'Default'
      return `${this.regionId} — ${this.range}/${
        this.interval
      } (grouped ${group})`
    }
  }
}

export default perfLogMixin
