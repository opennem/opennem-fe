<template>
  <div 
    :class="{ 'click-disable': !domainToggleable }" 
    class="summary-list">
    <div
      v-for="ft in order"
      :key="ft.id"
      class="item summary-row hoverable"
      @mouseenter="handleMouseEnter(ft)"
      @mouseleave="handleMouseLeave"
      @touchstart="handleTouchstart(ft)"
      @touchend="handleTouchend"
      @click.exact="handleRowClick(ft)"
      @click.shift.exact="handleRowShiftClicked(ft)"
    >
      <div 
        v-tooltip.auto="fuelTechList(ft)" 
        class="summary-col-label">
        <div
          :style="{
            'background-color': ft.hidden ? 'transparent' : ft.colour,
            'border-color': ft.hidden ? '#bbb' : ft.colour
          }"
          class="colour-square"
        />

        <div class="ft-label">{{ ft.label }}</div>
      </div>

      <div class="summary-col-external-link-icon">
        <a
          v-if="validDomainToEmit(ft)"
          @click.stop="handleFacilitiesLinkClick(ft)"
        >
          <i class="fal fa-external-link-square" />
        </a>
      </div>

      <div 
        v-if="isEnergyType" 
        class="summary-col-energy">
        <span v-if="showPointSummary">
          {{
            getValue(ft.id)
              | convertValue(chartUnitPrefix, chartDisplayPrefix)
              | formatValue
          }}
        </span>
        <span v-else-if="isTypeChangeSinceLine"> – </span>
        <span v-else>
          {{
            getValue(ft.id)
              | convertValue(chartUnitPrefix, chartDisplayPrefix)
              | formatValue
          }}
        </span>
      </div>
      <div 
        v-else 
        class="summary-col-energy">
        <span v-if="showPointSummary">
          {{
            getValue(ft.id)
              | convertValue(chartUnitPrefix, chartDisplayPrefix)
              | formatValue
          }}
        </span>
        <span v-else>
          {{ getValue(ft.id) | formatValue }}
        </span>
      </div>

      <div class="summary-col-contribution">
        <span v-show="showContribution(ft)">
          {{ getContribution(ft.id) | percentageFormatNumber }}
        </span>
      </div>

      <div 
        v-show="isAvValueColumn" 
        class="summary-col-av-value">
        {{ getAverageValue(ft) | formatCurrency }}
      </div>

      <div 
        v-show="isEmissionsVolumeColumn" 
        class="summary-col-ev">
        {{
          getEmissionsVolume(ft)
            | convertValue(
              chartEmissionsVolumeUnitPrefix,
              chartEmissionsVolumeDisplayPrefix
            )
            | formatValue
        }}
      </div>

      <div 
        v-show="isEmissionsIntensityColumn" 
        class="summary-col-ev">
        {{ getEmissionsIntensity(ft) | formatValue }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _isEmpty from 'lodash.isempty'
import _includes from 'lodash.includes'
import _remove from 'lodash.remove'
import _cloneDeep from 'lodash.clonedeep'
import { GROUP_DETAILED } from '@/constants/energy-fuel-techs'

export default {
  props: {
    energyDomains: {
      type: Array,
      default: () => []
    },
    emissionsDomains: {
      type: Array,
      default: () => []
    },
    originalOrder: {
      type: Array,
      default: () => []
    },
    marketValueOrder: {
      type: Array,
      default: () => []
    },
    hiddenFuelTechs: {
      type: Array,
      default: () => []
    },
    group: {
      type: String,
      default: () => ''
    },
    pointSummary: {
      type: Object,
      default: () => {}
    },
    pointSummaryTotal: {
      type: Number,
      default: () => 0
    },
    summary: {
      type: Object,
      default: () => {}
    },
    summaryTotal: {
      type: Number,
      default: () => 0
    },
    showPointSummary: {
      type: Boolean,
      default: () => false
    },
    domainToggleable: {
      type: Boolean,
      default: () => true
    },
    isYearInterval: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      order: [],
      mousedownDelay: null,
      longPress: 500,
      isWemOrAu: false
    }
  },

  computed: {
    ...mapGetters({
      fuelTechGroupName: 'fuelTechGroupName',
      percentContributionTo: 'percentContributionTo',
      interval: 'interval',

      isEnergyType: 'regionEnergy/isEnergyType',
      domainPowerEnergy: 'regionEnergy/domainPowerEnergy',

      isTypeChangeSinceLine: 'chartOptionsPowerEnergy/isTypeChangeSinceLine',
      chartEnergyRenewablesLine:
        'chartOptionsPowerEnergy/chartEnergyRenewablesLine',
      chartEnergyUnit: 'chartOptionsPowerEnergy/chartEnergyUnit',
      chartEnergyUnitPrefix: 'chartOptionsPowerEnergy/chartEnergyUnitPrefix',
      chartEnergyDisplayPrefix:
        'chartOptionsPowerEnergy/chartEnergyDisplayPrefix',
      chartEnergyCurrentUnit: 'chartOptionsPowerEnergy/chartEnergyCurrentUnit',

      chartPowerUnit: 'chartOptionsPowerEnergy/chartPowerUnit',
      chartPowerUnitPrefix: 'chartOptionsPowerEnergy/chartPowerUnitPrefix',
      chartPowerDisplayPrefix:
        'chartOptionsPowerEnergy/chartPowerDisplayPrefix',
      chartPowerCurrentUnit: 'chartOptionsPowerEnergy/chartPowerCurrentUnit',

      chartEmissionsVolumeUnitPrefix:
        'chartOptionsEmissionsVolume/chartUnitPrefix',
      chartEmissionsVolumeDisplayPrefix:
        'chartOptionsEmissionsVolume/chartDisplayPrefix'
    }),
    regionId() {
      return this.$route.params.region
    },
    chartUnitPrefix() {
      return this.isEnergyType
        ? this.chartEnergyUnitPrefix
        : this.chartPowerUnitPrefix
    },
    chartDisplayPrefix() {
      return this.isEnergyType
        ? this.chartEnergyDisplayPrefix
        : this.chartPowerDisplayPrefix
    },
    showSummaryColumn() {
      return this.$store.getters.showSummaryColumn
    },

    isAvValueColumn() {
      return this.showSummaryColumn === 'av-value'
    },

    isEmissionsVolumeColumn() {
      return this.showSummaryColumn === 'emissions-volume'
    },

    isEmissionsIntensityColumn() {
      return this.showSummaryColumn === 'emissions-intensity'
    },

    hasPointSummary() {
      return !_isEmpty(this.pointSummary)
    },

    hasMarketValueOrder() {
      return this.marketValueOrder.length > 0
    }
  },

  watch: {
    originalOrder(newOrder) {
      this.order = this.updateOrder(newOrder)
    },
    hiddenFuelTechs(fts) {
      this.order = this.updateOrder(this.originalOrder)
    }
  },

  created() {
    this.order = this.updateOrder(this.originalOrder)
    this.isWemOrAu = this.regionId === 'wem' || this.regionId === 'au'
  },

  methods: {
    fuelTechList(ft) {
      const domainIds = _cloneDeep(ft.domainIds)
      if (domainIds && domainIds.length > 1) {
        let list = ''
        domainIds.sort()
        domainIds.forEach((id) => {
          const find = this.domainPowerEnergy.find(
            (eDomain) => eDomain.id === id
          )
          if (find) {
            list += `${find.label}<br>`
          }
        })
        return list
      }
      return ''
    },

    handleRowClick(ft) {
      if (this.domainToggleable) {
        const property = ft.fuelTech ? 'fuelTech' : 'group'
        const hidden = _cloneDeep(this.hiddenFuelTechs)
        if (_includes(hidden, ft[property])) {
          _remove(hidden, (d) => d === ft[property])
        } else {
          hidden.push(ft[property])
        }
        this.order = this.updateOrder(this.originalOrder)
        this.$emit('fuelTechsHidden', hidden, false)
      }
    },

    handleRowShiftClicked(ft) {
      if (this.domainToggleable) {
        const property = ft.fuelTech ? 'fuelTech' : 'group'
        const hiddenObjs = this.order.filter(
          (d) => d[property] !== ft[property]
        )
        const hidden = hiddenObjs.map((d) => d[property])
        this.order = this.updateOrder(this.originalOrder)
        this.$emit('fuelTechsHidden', hidden, true, ft)
      }
    },

    updateOrder(order) {
      return order.map((d) => {
        return {
          category: d.category,
          colour: d.colour,
          domainIds: d.domainIds,
          fuelTech: d.fuelTech,
          group: d.group,
          id: d.id,
          label: d.label,
          type: d.type,
          hidden: this.isHidden(d)
        }
      })
    },

    isHidden(ft) {
      const property = ft.fuelTech ? 'fuelTech' : 'group'
      return _includes(this.hiddenFuelTechs, ft[property])
    },

    getValue(key) {
      return this.showPointSummary ? this.pointSummary[key] : this.summary[key]
    },

    getContribution(key) {
      const rowValue = this.showPointSummary
        ? this.pointSummary[key]
        : this.summary[key] || 0
      const total = this.showPointSummary
        ? this.pointSummaryTotal
        : this.summaryTotal

      return (rowValue / total) * 100
    },

    getAverageValue(ft) {
      const property =
        this.fuelTechGroupName === GROUP_DETAILED ? 'fuelTech' : 'group'
      const find = this.marketValueOrder.find(
        (d) => d[property] === ft[property]
      )
      const id = find ? find.id : null
      return this.showPointSummary ? this.pointSummary[id] : this.summary[id]
    },

    getEmissionsVolume(ft) {
      const ftGroup = ft.id.substring(0, ft.id.lastIndexOf('.'))
      const emissionId = `${ftGroup}.emissions`
      const emissionObj = this.emissionsDomains.find((d) => d.id === emissionId)
      if (emissionObj) {
        return this.showPointSummary
          ? this.pointSummary[emissionObj.id]
          : this.summary[emissionObj.id]
      }
      return '-'
    },

    getEmissionsIntensity(ft) {
      const ftGroup = ft.id.substring(0, ft.id.lastIndexOf('.'))
      const emissionId = `${ftGroup}.emissions`
      const energy = this.showPointSummary
        ? this.pointSummary[ft.id] || null
        : this.summary[ft.id] || null
      const emissionObj = this.emissionsDomains.find((d) => d.id === emissionId)

      if (energy && emissionObj) {
        let emissionsVolume = this.showPointSummary
          ? this.pointSummary[emissionObj.id]
          : this.summary[emissionObj.id]
        
        let ei = emissionsVolume / Math.abs(energy)

        if (!this.isEnergyType) {
          ei = ei * 1000

          if (this.isWemOrAu) {
            ei = ei * 2
          } else {
            ei = ei * 12
          }

          if (!this.showPointSummary) {
            // if 5m, divide by 12, else assume 30m, divide by 2 to convert energy /hr to power
            const time = this.interval === '5m' ? 12 : 2
            ei = ei / time / 1000
          }
        }

        return Math.abs(ei)
      }
      return '-'
    },

    showContribution(ft) {
      if (this.percentContributionTo === 'demand') {
        return true
      } else if (!_includes(ft.id, 'imports') && ft.category !== 'load') {
        return true
      }
      return false
    },

    handleTouchstart(ft) {
      this.mousedownDelay = setTimeout(() => {
        this.handleRowShiftClicked(ft)
      }, this.longPress)
    },
    handleTouchend() {
      this.clearTimeout()
    },
    clearTimeout() {
      clearTimeout(this.mousedownDelay)
      this.mousedownDelay = null
    },

    handleMouseEnter(ft) {
      this.$emit('mouse-enter', ft)
    },
    handleMouseLeave() {
      this.$emit('mouse-leave')
    },

    handleFacilitiesLinkClick(ft) {
      this.$emit('domain-click', ft)
    },

    validDomainToEmit(domain) {
      if (domain.category === 'source') {
        if (domain.fuelTech && domain.fuelTech !== 'imports') {
          return true
        } else if (domain.group) {
          const group = domain.group.split('.')
          if (group[group.length - 1] !== 'imports') {
            return true
          }
        }
      }

      return false
    }
  }
}
</script>
