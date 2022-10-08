import _cloneDeep from 'lodash.clonedeep'
import axisTimeFormat from '@/components/Vis/shared/timeFormat.js'
import AxisTicks from '@/services/axisTicks.js'
import DateDisplay from '@/services/DateDisplay.js'
import {
  INTERVAL_DAY,
  INTERVAL_WEEK,
  INTERVAL_MONTH,
  INTERVAL_SEASON,
  INTERVAL_QUARTER,
  INTERVAL_HALFYEAR,
  INTERVAL_FINYEAR,
  INTERVAL_YEAR
} from '@/constants/interval-filters.js'

export const state = () => ({
  isHovering: false,
  hoverDate: null,
  hoverDomain: null,
  highlightDomain: '',
  focusDate: null,
  xTicks: null,
  xGuides: [],
  yGuides: [],
  tickFormat: '',
  secondTickFormat: '',

  chartSummaryPie: true
})

export const getters = {
  isHovering: (state) => state.isHovering,
  hoverDate: (state) => state.hoverDate,
  hoverDomain: (state) => state.hoverDomain,
  highlightDomain: (state) => state.highlightDomain,
  isFocusing: (state) => state.focusDate !== null,
  focusDate: (state) => state.focusDate,
  xTicks: (state) => state.xTicks,
  xGuides: (state) => state.xGuides,
  yGuides: (state) => state.yGuides,
  tickFormat: (state) => state.tickFormat,
  secondTickFormat: (state) => state.secondTickFormat,

  chartSummaryPie: (state) => state.chartSummaryPie
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
  yGuides(state, yGuides) {
    state.yGuides = yGuides
  },
  tickFormat(state, tickFormat) {
    state.tickFormat = tickFormat
  },
  secondTickFormat(state, secondTickFormat) {
    state.secondTickFormat = secondTickFormat
  },

  chartSummaryPie(state, data) {
    state.chartSummaryPie = data
  }
}

export const actions = {
  doUpdateXTicks({ commit }, { range, interval, isZoomed, filterPeriod }) {
    commit('xTicks', AxisTicks(range, interval, isZoomed, filterPeriod))
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

  doUpdateTickFormats({ commit }, { range, interval, filterPeriod }) {
    let tickFormat = 'defaultFormat',
      secondTickFormat = 'secondaryFormat'
    switch (interval) {
      case INTERVAL_DAY:
        tickFormat = 'intervalDayTimeFormat'
        secondTickFormat = 'intervalDaySecondaryTimeFormat'
        break
      case INTERVAL_WEEK:
        tickFormat = 'intervalWeekTimeFormat'
        secondTickFormat = 'intervalWeekSecondaryTimeFormat'
        break
      case INTERVAL_MONTH:
        range === 'ALL'
          ? (tickFormat = 'rangeAllIntervalMonthTimeFormat')
          : (tickFormat = 'intervalMonthTimeFormat')
        break
      case INTERVAL_FINYEAR:
        tickFormat = (d) => {
          const year = d.getFullYear() + 1 + ''
          return `FY${year.substr(2, 2)}`
        }
        break
      case INTERVAL_HALFYEAR:
      case INTERVAL_SEASON:
      case INTERVAL_QUARTER:
        tickFormat = (d) => {
          const year = d.getFullYear() + ''
          const nextYear = d.getFullYear() + 1 + ''
          const yearStr =
            filterPeriod === 'Summer'
              ? `${year}/${nextYear.substr(2, 2)}`
              : year
          return `${yearStr}`
        }
        break
      case INTERVAL_YEAR:
        tickFormat = 'rangeAllIntervalMonthTimeFormat'
        break
      default:
        tickFormat = axisTimeFormat
    }

    commit('tickFormat', tickFormat)
    commit('secondTickFormat', secondTickFormat)
  }
}
