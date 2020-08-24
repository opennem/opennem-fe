export const state = () => ({
  chartType: 'area', // line, proportion, area, hidden
  chartYAxis: 'absolute', // absolute, percentage
  chartCurve: 'step' // smooth, step, linear
})

export const getters = {
  chartShown: state => state.chartType !== 'hidden',
  chartType: state => state.chartType,
  chartYAxis: state => state.chartYAxis,
  chartCurve: state => state.chartCurve
}

export const mutations = {
  chartType(state, data) {
    state.chartType = data
  },
  chartYAxis(state, data) {
    state.chartYAxis = data
  },
  chartCurve(state, data) {
    state.chartCurve = data
  }
}

export const actions = {}
