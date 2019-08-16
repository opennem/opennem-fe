<template>
  <div class="summary-table">
    <header>
      <span v-if="!hoverOn">
        <time :datetime="startDateTime">
          <!-- {{ startDate | formatDate }} -->
          {{ startDate | customFormatDate({ range, interval, isStart: true }) }}
        </time>
        –
        <time :datetime="endDateTime">
          <!-- {{ endDate | formatDate }} -->
          {{ endDate | customFormatDate({ range, interval, showYear: true, isEnd: true }) }}
        </time>
      </span>
      
      <time
        v-if="hoverOn" 
        :datetime="hoveredDateTime">
        {{ hoveredDate | customFormatDate({ range, interval, showIntervalRange: true }) }}
      </time>
    </header>

    <div class="summary-column-headers">
      <div class="summary-row">
        <div
          class="summary-col-label"
          style="padding-top: 3px;">
          <group-selector v-if="groupSelection" />
        </div>
        <div
          v-if="!hoverOn || isEnergy"
          class="summary-col-energy">
          Energy <small>{{ isYearInterval ? 'TWh' : 'GWh' }}</small>
        </div>
        <div
          v-if="hoverOn && !isEnergy"
          class="summary-col-energy">
          Power <small>MW</small>
        </div>
        <div
          class="summary-col-contribution contribution-toggle"
          @click="handlePercentContributionToClick">
          Contribution <small>to {{ percentContributionTo }}</small>
        </div>
        <div class="summary-col-av-value">Av.Value <small>$/MWh</small></div>
      </div>
      <div class="summary-row">
        <div class="summary-col-label">Sources</div>
        <div
          v-if="!hoverOn"
          class="summary-col-energy cell-value">
          {{ summarySources._totalEnergy | formatValue }}
        </div>
        <div
          v-if="hoverOn"
          class="summary-col-energy cell-value">
          {{ pointSummarySources._total | formatValue }}
        </div>
        <div class="summary-col-contribution cell-value" />
        <div
          v-if="!hoverOn"
          class="summary-col-av-value cell-value">
          {{ summary._totalAverageValue | formatCurrency }}
        </div>
        <div
          v-if="hoverOn"
          class="summary-col-av-value cell-value">
          {{ pointSummary._totalAverageValue | formatCurrency }}
        </div>
      </div>
    </div>

    <items
      :group="'ft-sources'"
      :hidden-fuel-techs="hiddenSources"
      :original-order="sourcesOrder"
      :market-value-order="sourcesMarketValueOrder"
      :show-point-summary="hoverOn"
      :point-summary="pointSummarySources"
      :point-summary-total="pointSummary._total"
      :summary="summarySources"
      :summary-total="summarySourcesTotal"
      :domain-toggleable="domainToggleable"
      :energy-domains="energyDomains"
      @update="handleSourcesOrderUpdate"
      @fuelTechsHidden="handleSourceFuelTechsHidden"
    />
    
    <div class="summary-column-headers">
      <div class="summary-row">
        <div class="summary-col-label">Loads</div>
        <div
          v-if="!hoverOn"
          class="summary-col-energy cell-value">
          {{ summaryLoads._totalEnergy | formatValue }}
        </div>
        <div
          v-if="hoverOn"
          class="summary-col-energy cell-value">
          {{ pointSummaryLoads._total | formatValue }}
        </div>
        <div class="summary-col-contribution cell-value" />
        <div class="summary-col-av-value cell-value" />
      </div>
    </div>

    <items
      :group="'ft-loads'"
      :hidden-fuel-techs="hiddenLoads"
      :original-order="loadsOrder"
      :market-value-order="loadsMarketValueOrder"
      :show-point-summary="hoverOn"
      :point-summary="pointSummaryLoads"
      :point-summary-total="pointSummary._total"
      :summary="summaryLoads"
      :summary-total="summary._totalEnergy"
      :show-percent-column="percentContributionTo === 'demand'"
      @update="handleLoadsOrderUpdate"
      @fuelTechsHidden="handleLoadFuelTechsHidden"
    />

    <div class="summary-column-headers">
      <div class="summary-row last-row">
        <div class="summary-col-label">Net</div>
        <div
          v-if="!hoverOn"
          class="summary-col-energy cell-value">
          {{ summary._totalEnergy | formatValue }}
        </div>
        <div
          v-if="hoverOn"
          class="summary-col-energy cell-value">
          {{ pointSummary._total | formatValue }}
        </div>
        <div class="summary-col-contribution cell-value" />
        <div class="summary-col-av-value cell-value" />
      </div>
    </div>

    <div class="summary-column-headers">
      <div class="summary-row last-row">
        <div class="summary-col-label">Renewables</div>
        <div class="summary-col-energy cell-value" />
        <div
          v-if="!hoverOn"
          class="summary-col-contribution cell-value">
          {{ renewables | percentageFormatNumber }}
        </div>
        <div
          v-if="hoverOn"
          class="summary-col-contribution cell-value">
          {{ pointRenewables | percentageFormatNumber }}
        </div>
        <div class="summary-col-av-value cell-value" />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import _isEmpty from 'lodash.isempty'
import _cloneDeep from 'lodash.clonedeep'
import GroupSelector from '~/components/ui/FuelTechGroupSelector'
import Items from './Items'

export default {
  components: {
    GroupSelector,
    Items
  },

  props: {
    energyDomains: {
      type: Array,
      default: () => []
    },
    domains: {
      type: Array,
      default: () => []
    },
    marketValueDomains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    hiddenFuelTechs: {
      type: Array,
      default: () => []
    },
    hoverDate: {
      type: Date,
      default: () => null
    },
    hoverOn: {
      type: Boolean,
      default: () => false
    },
    priceId: {
      type: String,
      default: () => ''
    },
    temperatureId: {
      type: String,
      default: () => ''
    },
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    },
    isEnergy: {
      type: Boolean,
      default: () => false
    },
    domainToggleable: {
      type: Boolean,
      default: () => true
    },
    groupSelection: {
      type: Boolean,
      default: () => true
    }
  },

  data() {
    return {
      summary: {},
      summarySources: {},
      summaryLoads: {},
      pointSummary: {},
      pointSummarySources: {},
      pointSummaryLoads: {},
      hiddenSources: [],
      hiddenLoads: [],
      hoveredTemperature: 0
    }
  },

  computed: {
    fuelTechGroupName() {
      return this.$store.getters.fuelTechGroupName
    },

    percentContributionTo() {
      return this.$store.getters.percentContributionTo
    },

    sourcesOrderLength() {
      return this.domains.filter(
        d => d.category === 'source' || d.category === 'load'
      ).length
    },

    sourcesOrder() {
      return this.domains.filter(d => d.category === 'source')
    },

    loadsOrder() {
      return this.domains.filter(d => d.category === 'load')
    },

    sourcesMarketValueOrder() {
      return this.marketValueDomains.filter(d => d.category === 'source')
    },

    loadsMarketValueOrder() {
      return this.marketValueDomains.filter(d => d.category === 'load')
    },

    renewables() {
      const key =
        this.percentContributionTo === 'demand' ? '_total' : '_totalGeneration'
      const totalRenewables = this.dataset.reduce(
        (a, b) => a + b._totalRenewables,
        0
      )
      const totalDemand = this.dataset.reduce((a, b) => a + b[key], 0)
      return (totalRenewables / totalDemand) * 100
    },

    pointRenewables() {
      const key =
        this.percentContributionTo === 'demand' ? '_total' : '_totalGeneration'
      const totalRenewables = this.pointSummary._totalRenewables
      const totalDemand = this.pointSummary[key]
      return (totalRenewables / totalDemand) * 100
    },

    summarySourcesTotal() {
      if (this.percentContributionTo === 'demand') {
        return this.summary._totalEnergy
      } else {
        return this.summarySources._totalEnergy
      }
    },

    intervalMins() {
      const interval = this.interval
      if (interval === '30m') {
        return 30
      } else if (interval === 'Day') {
        return 60 * 24
      }
      // default 5 mins
      return 5
    },

    hoveredDate() {
      const item = this.pointSummary
      return item ? item.date : null
    },

    hoveredDateTime() {
      const item = this.pointSummary
      const date = item ? item.date : null
      return date ? new Date(date).toISOString() : ''
    },

    startDate() {
      const dataLength = this.dataset.length
      const startDate = dataLength > 0 ? this.dataset[0].date : null
      return startDate
    },

    startDateTime() {
      // const dataLength = this.dataset.length
      // const startDate = dataLength > 0 ? this.dataset[0].date : null
      return this.startDate ? new Date(this.startDate).toISOString() : ''
    },

    endDate() {
      const powerRange =
        this.range === '1D' || this.range === '3D' || this.range === '7D'
      const dataLength = this.dataset.length
      const whichIndex = powerRange ? 1 : 2
      const endDate =
        dataLength > 0 ? this.dataset[dataLength - whichIndex].date : null
      return endDate
    },

    endDateTime() {
      // const dataLength = this.dataset.length
      // const endDate = dataLength > 0 ? this.dataset[dataLength - 1].date : null
      return this.endDate ? new Date(this.endDate).toISOString() : ''
    },

    isYearInterval() {
      return this.interval === 'Fin Year' || this.interval === 'Year'
    }
  },

  watch: {
    fuelTechGroupName() {
      // clear hidden fuel techs when grouping is changed
      this.hiddenSources = []
      this.hiddenLoads = []
      this.emitHiddenFuelTechs()
    },
    dataset(updated) {
      this.calculateSummary(updated)
    },
    domains(updated) {
      this.calculateSummary(this.dataset)
    },
    hoverDate(date) {
      this.updatePointSummary(date)
    }
  },

  mounted() {
    this.hiddenFuelTechs.forEach(fuelTech => {
      const find = this.domains.find(domain => domain.fuelTech === fuelTech)
      if (find) {
        if (find.category === 'source') {
          this.hiddenSources.push(fuelTech)
        } else {
          this.hiddenLoads.push(fuelTech)
        }
      }
    })
    this.calculateSummary(this.dataset)
  },

  methods: {
    calculateSummary(data) {
      let total = 0
      let totalSources = 0
      let totalLoads = 0
      let totalPriceMarketValue = 0
      this.summary = {}
      this.summarySources = {}
      this.summaryLoads = {}

      const energySummary = data.map(d => {
        let p = 0
        this.domains.forEach(ft => {
          p += d[ft.id] || 0
        })
        return p
      })
      const energySummaryTotal = energySummary.reduce((a, b) => a + b, 0)
      const volWeightPrice = energySummary.map((d, i) => {
        const price = data[i][this.priceId]
        return price * d
      })
      const volWeightPriceTotal = volWeightPrice.reduce((a, b) => a + b, 0)

      // Calculate Energy
      this.domains.forEach(ft => {
        const category = ft.category
        const dataEnergy = data.map(d => {
          const energy = {}

          if (this.isEnergy) {
            energy[ft.id] = d[ft.id]
          } else {
            // calculate energy (GWh) += power * 5mins/60/100
            const mins = this.interval === '30m' ? 30 : 5
            energy[ft.id] = (d[ft.id] * mins) / 60 / 1000
          }

          return energy
        })
        const dataEnergySum = dataEnergy.reduce(
          (prev, cur) => prev + cur[ft.id],
          0
        )
        let avValue = 0

        this.summary[ft.id] = dataEnergySum
        total += dataEnergySum

        if (category === 'source') {
          this.summarySources[ft.id] = dataEnergySum
          totalSources += dataEnergySum
        } else if (category === 'load') {
          this.summaryLoads[ft.id] = dataEnergySum
          totalLoads += dataEnergySum
        }
      })

      // Calculate Market Value for Energy
      this.marketValueDomains.forEach((ft, index) => {
        const category = ft.category
        let avValue = null
        let dataMarketValueSum = 0

        if (this.isEnergy) {
          const dataMarketValue = data.map(d => {
            const marketValue = {}
            marketValue[ft.id] = Math.abs(d[ft.id])
            return marketValue
          })
          dataMarketValueSum = dataMarketValue.reduce(
            (prev, cur) => prev + cur[ft.id],
            0
          )
          const ftTotal = Math.abs(this.summary[this.domains[index].id])
          avValue = this.isYearInterval
            ? dataMarketValueSum / ftTotal / 1000 / 1000
            : dataMarketValueSum / ftTotal / 1000
        } else {
          const ftId = this.domains[index].id
          const dataPowerTotal = data.reduce((a, b) => a + (b[ftId] || 0), 0)
          // calculate the price * ft total
          const ftPrice = data.map((d, i) => {
            const price = data[i][this.priceId] ? data[i][this.priceId] : 0
            return Math.abs(d[ftId]) * price
          })
          const ftPriceTotal = ftPrice.reduce((a, b) => a + b, 0)
          avValue = ftPriceTotal / Math.abs(dataPowerTotal)
        }

        this.summary[ft.id] = avValue
        totalPriceMarketValue += dataMarketValueSum

        if (category === 'source') {
          this.summarySources[ft.id] = avValue
        } else if (category === 'load') {
          this.summaryLoads[ft.id] = avValue
        }
      })

      const totalAverageValue =
        this.isEnergy && !this.isYearInterval
          ? totalPriceMarketValue / energySummaryTotal / 1000
          : volWeightPriceTotal / energySummaryTotal / 1000 / 1000
      this.summary._totalEnergy = total
      this.summary._totalAverageValue = totalAverageValue
      this.summarySources._totalEnergy = totalSources
      this.summaryLoads._totalEnergy = totalLoads
    },

    calculatePointSummary(data) {
      let totalSources = 0
      let totalLoads = 0
      let totalPriceMarketValue = 0
      this.pointSummary = data || {} // pointSummary._total is already calculated
      this.pointSummarySources = {}
      this.pointSummaryLoads = {}

      if (!_isEmpty(this.pointSummary)) {
        this.domains.forEach(ft => {
          const category = ft.category
          const value = this.pointSummary[ft.id]

          if (category === 'source') {
            this.pointSummarySources[ft.id] = value
            totalSources += value
          } else if (category === 'load') {
            this.pointSummaryLoads[ft.id] = value
            totalLoads += value
          }
        })

        // Calculate Market Value
        this.marketValueDomains.forEach((ft, index) => {
          const category = ft.category
          const value = Math.abs(this.pointSummary[ft.id])
          const ftTotal = Math.abs(this.pointSummary[this.domains[index].id])
          const avValue = this.isYearInterval
            ? value / ftTotal / 1000 / 1000
            : value / ftTotal / 1000

          this.pointSummary[ft.id] = avValue
          totalPriceMarketValue += value

          if (category === 'source') {
            this.pointSummarySources[ft.id] = avValue
          } else if (category === 'load') {
            this.pointSummaryLoads[ft.id] = avValue
          }
        })
      }

      if (this.priceId) {
        this.pointSummary._totalAverageValue = this.pointSummary[this.priceId]
      } else {
        this.pointSummary._totalAverageValue = this.isYearInterval
          ? totalPriceMarketValue / this.pointSummary._total / 1000 / 1000
          : totalPriceMarketValue / this.pointSummary._total / 1000
      }
      this.pointSummarySources._total = totalSources
      this.pointSummaryLoads._total = totalLoads
    },

    updatePointSummary(date) {
      const dataFound = this.dataset.find(d => {
        const fDate = moment(d.date)
        const rDate = moment(date)
        if (this.interval === 'Day') {
          fDate.hour(0)
          fDate.minute(0)
          fDate.second(0)

          return fDate.valueOf() === rDate.valueOf()
        } else {
          return d.date === rDate.valueOf()
        }
      })

      this.hoveredTemperature =
        dataFound && dataFound[this.temperatureId]
          ? dataFound[this.temperatureId]
          : ''
      this.calculatePointSummary(_cloneDeep(dataFound))
    },

    handleSourcesOrderUpdate(newSourceOrder) {
      this.setFuelTechOrder(newSourceOrder, this.loadsOrder)
    },

    handleLoadsOrderUpdate(newLoadsOrder) {
      this.setFuelTechOrder(this.sourcesOrder, newLoadsOrder)
    },

    setFuelTechOrder(sources, loads) {
      const loadsOrder = loads.map(d => d.fuelTech)
      const sourcesOrder = sources.map(d => d.fuelTech)
      const order = [...sourcesOrder, ...loadsOrder]
      this.$store.dispatch('fuelTechOrder', order.reverse())
    },

    emitHiddenFuelTechs() {
      let hiddenFuelTechs = [...this.hiddenSources, ...this.hiddenLoads]

      // if all is hidden, then unhide all
      if (hiddenFuelTechs.length === this.sourcesOrderLength) {
        this.hiddenSources = []
        this.hiddenLoads = []
        hiddenFuelTechs = []
      }
      this.$emit('fuelTechsHidden', hiddenFuelTechs)
    },

    handleSourceFuelTechsHidden(hidden, hideOthers) {
      const property = this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'id'
      this.hiddenSources = hidden
      if (hideOthers) {
        this.hiddenLoads = this.loadsOrder.map(d => d[property])
      }
      this.emitHiddenFuelTechs()
    },

    handleLoadFuelTechsHidden(hidden, hideOthers) {
      const property = this.fuelTechGroupName === 'Default' ? 'fuelTech' : 'id'
      this.hiddenLoads = hidden
      if (hideOthers) {
        this.hiddenSources = this.sourcesOrder.map(d => d[property])
      }
      this.emitHiddenFuelTechs()
    },

    handlePercentContributionToClick() {
      if (this.percentContributionTo === 'demand') {
        this.$store.dispatch('percentContributionTo', 'generation')
      } else {
        this.$store.dispatch('percentContributionTo', 'demand')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.summary-table {
  color: #333;
  font-size: 11px;

  header {
    text-align: right;
    font-size: 16px;
    font-weight: 300;
    color: #000;
    padding-bottom: $app-padding / 5;
    border-bottom: 1px solid #000;
    user-select: none;
  }

  .cell-value {
    font-family: $family-primary;
  }
}

.contribution-toggle {
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }
}

::v-deep .summary-column-headers {
  .summary-row {
    font-family: $header-font-family;
    font-weight: 700;
  }
}

::v-deep .summary-row {
  display: flex;
  font-size: 1em;
  padding: 3px 4px;
  border-bottom: 1px solid #ddd;

  &.last-row {
    border-bottom-color: #000;
  }

  .summary-col-label {
    width: 50%;
  }
  .summary-col-energy,
  .summary-col-contribution,
  .summary-col-av-value {
    width: 25%;
    text-align: right;
    padding: 0 5px;
  }

  small {
    display: block;
    color: #999;
  }
}
</style>
