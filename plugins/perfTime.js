import { format as d3Format } from 'd3-format'
// import console from './console.js'

export default class PerfTime {
  constructor(label) {
    this.t0 = null
    this.label = label
    this.formatString = d3Format(',.0f')
  }

  time() {
    if (typeof performance !== 'undefined') {
      this.t0 = performance.now()
    }
  }

  timeEnd(label) {
    const formatted =
      typeof performance !== 'undefined'
        ? this.formatString(performance.now() - this.t0)
        : 0
    console.info(`${label}: ${formatted}ms`)
    this.t0 = null
  }
}
