import { format as d3Format } from 'd3-format'
import console from './console.js'

export default class PerfTime {
  constructor(label) {
    this.t0 = null
    this.label = label
    this.formatString = d3Format(',.0f')
  }

  time() {
    this.t0 = performance.now()
  }

  timeEnd(label) {
    const formatted = this.formatString(performance.now() - this.t0)
    console().info(`${label}: ${formatted}ms`)
    this.t0 = null
  }
}
