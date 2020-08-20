import _cloneDeep from 'lodash.clonedeep'
import AxisTicks from '@/services/axisTicks.js'
import AxisTimeFormats from '@/services/axisTimeFormats.js'
import DateDisplay from '@/services/DateDisplay.js'

export const state = () => ({
  isHovering: false,
  hoverDate: null,
  hoverDomain: null,
  highlightDomain: '',
  focusDate: null,
  xTicks: null,
  xGuides: null,
  tickFormat: null,
  secondTickFormat: null,

  chartEnergyType: 'area', // line, proportion, area, hidden
  chartEnergyYAxis: 'absolute', // absolute, percentage
  chartEnergyCurve: 'step', // smooth, step, linear
  chartPowerCurve: 'smooth', // smooth, step, linear
  chartEnergyRenewablesLine: false,
  chartEmissionsVolume: true,
  chartEmissionsIntensity: true,
  chartPrice: true,
  chartTemperature: true,
  chartSummaryPie: true
})

export const getters = {
  isHovering: state => state.isHovering,
  hoverDate: state => state.hoverDate,
  hoverDomain: state => state.hoverDomain,
  highlightDomain: state => state.highlightDomain,
  isFocusing: state => state.focusDate !== null,
  focusDate: state => state.focusDate,
  xTicks: state => state.xTicks,
  xGuides: state => state.xGuides,
  tickFormat: state => state.tickFormat,
  secondTickFormat: state => state.secondTickFormat,

  chartEnergy: state => state.chartEnergyType !== 'hidden',
  chartEnergyType: state => state.chartEnergyType,
  chartEnergyYAxis: state => state.chartEnergyYAxis,
  chartEnergyCurve: state => state.chartEnergyCurve,
  chartPowerCurve: state => state.chartPowerCurve,
  chartEnergyRenewablesLine: state => state.chartEnergyRenewablesLine,
  chartEmissionsVolume: state => state.chartEmissionsVolume,
  chartEmissionsIntensity: state => state.chartEmissionsIntensity,
  chartPrice: state => state.chartPrice,
  chartTemperature: state => state.chartTemperature,
  chartSummaryPie: state => state.chartSummaryPie
}

export const mutations = {
  isHovering(state, isHovering) {
    state.isHovering = isHovering
  },
  hoverDate(state, hoverDate) {
    state.hoverDate = hoverDate
  },
  hoverDomain(state, hoverDomain) {
    state.hoverDomain = hoverDomain
  },
  highlightDomain(state, highlightDomain) {
    state.highlightDomain = highlightDomain
  },
  focusDate(state, focusDate) {
    state.focusDate = focusDate
  },
  xTicks(state, xTicks) {
    state.xTicks = xTicks
  },
  xGuides(state, xGuides) {
    state.xGuides = xGuides
  },
  tickFormat(state, tickFormat) {
    state.tickFormat = tickFormat
  },
  secondTickFormat(state, secondTickFormat) {
    state.secondTickFormat = secondTickFormat
  },

  chartEnergyType(state, data) {
    state.chartEnergyType = data
  },
  chartEnergyYAxis(state, data) {
    state.chartEnergyYAxis = data
  },
  chartEnergyCurve(state, data) {
    state.chartEnergyCurve = data
  },
  chartPowerCurve(state, data) {
    state.chartPowerCurve = data
  },
  chartEnergyRenewablesLine(state, data) {
    state.chartEnergyRenewablesLine = data
  },
  chartEmissionsVolume(state, data) {
    state.chartEmissionsVolume = data
  },
  chartEmissionsIntensity(state, data) {
    state.chartEmissionsIntensity = data
  },
  chartPrice(state, data) {
    state.chartPrice = data
  },
  chartTemperature(state, data) {
    state.chartTemperature = data
  },
  chartSummaryPie(state, data) {
    state.chartSummaryPie = data
  }
}

export const actions = {
  doUpdateXTicks({ commit }, { range, interval, isZoomed }) {
    commit('xTicks', AxisTicks(range, interval, isZoomed))
  },

  doUpdateXGuides({ commit }, { interval, start, end }) {
    let xGuides = []
    if (interval === 'Day') {
      xGuides = DateDisplay.weekendGuides(start, end)
    }
    if (interval === '5m' || interval === '30m') {
      xGuides = DateDisplay.nightGuides(start, end)
    }
    commit('xGuides', xGuides)
  },

  doUpdateTickFormats({ commit }, { range, interval }) {
    let tickFormat = null,
      secondTickFormat = null
    switch (interval) {
      case 'Day':
        tickFormat = AxisTimeFormats.intervalDayTimeFormat
        secondTickFormat = AxisTimeFormats.intervalDaySecondaryTimeFormat
        break
      case 'Week':
        tickFormat = AxisTimeFormats.intervalWeekTimeFormat
        secondTickFormat = AxisTimeFormats.intervalWeekSecondaryTimeFormat
        break
      case 'Month':
        range === 'ALL'
          ? (tickFormat = AxisTimeFormats.rangeAllIntervalMonthTimeFormat)
          : (tickFormat = AxisTimeFormats.intervalMonthTimeFormat)
      case 'Fin Year':
        tickFormat = d => {
          const year = d.getFullYear() + 1 + ''
          return `FY${year.substr(2, 2)}`
        }
      default:
        tickFormat = AxisTimeFormats.defaultFormat
        secondTickFormat = AxisTimeFormats.secondaryFormat
    }
    commit('tickFormat', tickFormat)
    commit('secondTickFormat', secondTickFormat)
  }
}
