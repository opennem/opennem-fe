import cloneDeep from 'lodash.clonedeep'
import * as FUEL_TECHS from '~/constants/fuelTech.js'
import * as SimplifiedGroup from '~/constants/group-simplified.js'
import * as FlexibilityGroup from '~/constants/group-flexibility.js'
import * as RenewableFossilGroup from '~/constants/group-renewable-fossil.js'
import * as SolarResidualGroup from '~/constants/group-solar-residual.js'

export const state = () => ({
  currentView: 'energy', // energy, facilities
  nem: [],
  fuelTechMeta: null,
  fuelTechNames: null,
  fuelTechGroupName: 'Default',
  fuelTechOrder: cloneDeep(FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER),
  hiddenFuelTechs: [],
  energyDomains: [],
  priceDomains: [],
  temperatureDomains: [],
  marketValueDomains: [],
  range: '7D',
  interval: '30m',
  dateFilter: [],
  exportData: [],
  facilityExportData: [],
  responsiveBreakWidth: 769,
  chartEmissionsVolume: true,
  chartEmissionsIntensity: true,
  chartPrice: true,
  chartTemperature: true,
  chartSummaryPie: true,
  exportAttribution: '@name',
  percentContributionTo: 'demand', // or generation
  featureEmissions: false
})

export const mutations = {
  currentView(state, data) {
    state.currentView = data
  },
  nem(state, data) {
    state.nem = data
  },
  fuelTechMeta(state, data) {
    state.fuelTechMeta = cloneDeep(data)
  },
  fuelTechNames(state, data) {
    state.fuelTechNames = cloneDeep(data)
  },
  fuelTechGroupName(state, data) {
    state.fuelTechGroupName = data
  },
  fuelTechOrder(state, data) {
    state.fuelTechOrder = data
  },
  hiddenFuelTechs(state, data) {
    state.hiddenFuelTechs = data
  },
  energyDomains(state, data) {
    state.energyDomains = data
  },
  priceDomains(state, data) {
    state.priceDomains = data
  },
  temperatureDomains(state, data) {
    state.temperatureDomains = data
  },
  marketValueDomains(state, data) {
    state.marketValueDomains = data
  },
  range(state, data) {
    state.range = data
  },
  interval(state, data) {
    state.interval = data
  },
  dateFilter(state, data) {
    state.dateFilter = data
  },
  exportData(state, data) {
    state.exportData = data
  },
  facilityExportData(state, data) {
    state.facilityExportData = data
  },
  responsiveBreakWidth(state, data) {
    state.responsiveBreakWidth = data
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
  },
  exportAttribution(state, data) {
    state.exportAttribution = data
  },
  percentContributionTo(state, data) {
    state.percentContributionTo = data
  },
  featureEmissions(state, data) {
    state.featureEmissions = data
  }
}

export const getters = {
  currentView: state => state.currentView,
  nemLength: state => state.nem.length,
  nemData: state => state.nem,
  fuelTechMeta: state => state.fuelTechMeta,
  fuelTechNames: state => state.fuelTechNames,
  fuelTechGroupName: state => state.fuelTechGroupName,
  fuelTechGroup: state => {
    const fuelTechGroupName = state.fuelTechGroupName
    let group = null
    switch (fuelTechGroupName) {
      case 'Simplified':
        group = SimplifiedGroup
        break
      case 'Flexibility':
        group = FlexibilityGroup
        break
      case 'Renewable/Fossil':
        group = RenewableFossilGroup
        break
      case 'Solar/Residual':
        group = SolarResidualGroup
        break
      default:
    }
    return group
  },
  fuelTechOrder: state => state.fuelTechOrder,
  hiddenFuelTechs: state => state.hiddenFuelTechs,
  energyDomains: state => state.energyDomains,
  priceDomains: state => state.priceDomains,
  temperatureDomains: state => state.temperatureDomains,
  marketValueDomains: state => state.marketValueDomains,
  range: state => state.range,
  energyCurveType: state => {
    switch (state.range) {
      case '1D':
      case '3D':
      case '7D':
        return 'smooth'
      default:
        return 'step'
    }
  },
  step: state => {
    switch (state.range) {
      case '1D':
      case '3D':
      case '7D':
        return false
      default:
        return true
    }
  },
  energyChartType: state => {
    switch (state.range) {
      case '1D':
      case '3D':
      case '7D':
        return 'power'
      default:
        return 'energy'
    }
  },
  chartUnit: state => {
    switch (state.range) {
      case '1D':
      case '3D':
      case '7D':
        return ' MW'
      default:
        if (state.interval === 'Fin Year' || state.interval === 'Year') {
          return ' TWh'
        }
        return ' GWh'
    }
  },
  interval: state => state.interval,
  dateFilter: state => state.dateFilter,
  exportData: state => state.exportData,
  facilityExportData: state => state.facilityExportData,
  responsiveBreakWidth: state => state.responsiveBreakWidth,
  chartEmissionsVolume: state => state.chartEmissionsVolume,
  chartEmissionsIntensity: state => state.chartEmissionsIntensity,
  chartPrice: state => state.chartPrice,
  chartTemperature: state => state.chartTemperature,
  chartSummaryPie: state => state.chartSummaryPie,
  exportAttribution: state => state.exportAttribution,
  percentContributionTo: state => state.percentContributionTo,
  featureEmissions: state => state.featureEmissions
}

export const actions = {
  currentView({ commit }, data) {
    commit('currentView', data)
  },
  fuelTechMeta({ commit }, data) {
    commit('fuelTechMeta', data)
  },
  fuelTechNames({ commit }, data) {
    commit('fuelTechNames', data)
  },
  fuelTechGroupName({ commit }, data) {
    commit('fuelTechGroupName', data)
  },
  fuelTechOrder({ commit }, data) {
    commit('fuelTechOrder', data)
  },
  hiddenFuelTechs({ commit }, data) {
    commit('hiddenFuelTechs', data)
  },
  energyDomains({ commit }, data) {
    commit('energyDomains', data)
  },
  priceDomains({ commit }, data) {
    commit('priceDomains', data)
  },
  temperatureDomains({ commit }, data) {
    commit('temperatureDomains', data)
  },
  marketValueDomains({ commit }, data) {
    commit('marketValueDomains', data)
  },
  range({ commit }, data) {
    commit('range', data)
  },
  interval({ commit }, data) {
    commit('interval', data)
  },
  dateFilter({ commit }, data) {
    commit('dateFilter', data)
  },
  exportData({ commit }, data) {
    commit('exportData', data)
  },
  facilityExportData({ commit }, data) {
    commit('facilityExportData', data)
  },
  responsiveBreakWidth({ commit }, data) {
    commit('responsiveBreakWidth', data)
  },
  chartEmissionsVolume({ commit }, data) {
    commit('chartEmissionsVolume', data)
  },
  chartEmissionsIntensity({ commit }, data) {
    commit('chartEmissionsIntensity', data)
  },
  chartPrice({ commit }, data) {
    commit('chartPrice', data)
  },
  chartTemperature({ commit }, data) {
    commit('chartTemperature', data)
  },
  chartSummaryPie({ commit }, data) {
    commit('chartSummaryPie', data)
  },
  exportAttribution({ commit }, data) {
    commit('exportAttribution', data)
  },
  percentContributionTo({ commit }, data) {
    commit('percentContributionTo', data)
  },
  featureEmissions({ commit }, data) {
    commit('featureEmissions', data)
  }
}
