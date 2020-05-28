<template>
  <div>
    <dates-display
      :start-date="startDate"
      :end-date="endDate"
      :hovered-date="timeHovered"
      :range="range"
      :interval="interval"
    />
    <div class="summary">
      <div class="summary-header">
        <div class="summary-row">
          <div class="item-region summary-item">
            <group-selector />
          </div>
          <div class="item-energy summary-item">
            <span>Energy</span>
            <small>GWh</small>
          </div>
          <div class="item-contribution summary-item">
            <span>Contribution</span>
            <small>to demand</small>
          </div>
          <div class="item-price summary-item">
            <span>Av.Value</span>
            <small>$/MWh</small>
          </div>
        </div>
      </div>
      <div class="summary-list">
        <div 
          v-for="d in domains" 
          :key="d.domain" 
          class="summary-row">
          <div class="item-region summary-item">
            
            <span 
              :style="{
                'background-color': d.colour
              }" 
              class="colour-square"/>
            <strong>{{ d.label }}</strong>
          </div>

          <div class="item-energy summary-item">{{ getEnergyValue(d.domain) }}</div>
          <div class="item-contribution summary-item"/>
          <!-- <div class="summary-item">{{ getEmissionValue(d.domain) }}</div> -->
          <div class="item-price summary-item">{{ getPriceValue(d.domain) }}</div>
          <!-- <div class="summary-item">{{ getTemperatureValue(d.domain) }}</div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatesDisplay from '~/components/SummaryTable/DatesDisplay'
import GroupSelector from '~/components/ui/FuelTechGroupSelector'

export default {
  components: {
    GroupSelector,
    DatesDisplay
  },
  props: {
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Object,
      default: () => {}
    },
    dateHovered: {
      type: Date,
      default: () => null
    },
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    }
  },

  computed: {
    timeHovered() {
      return this.dateHovered ? this.dateHovered.getTime() : 0
    },
    startDate() {
      console.log(this.dataset)

      const dataset = this.dataset.energy
      const dataLength = dataset.length
      const startDate = dataLength > 0 ? dataset[0].date : null
      return startDate
    },
    endDate() {
      const dataset = this.dataset.energy
      const dataLength = dataset.length
      let whichIndex = 1
      if (this.range === '30D' || this.range === '1Y' || this.range === 'ALL') {
        whichIndex = 2
      }
      if (dataLength > 0) {
        const date = dataset[dataLength - whichIndex]
          ? dataset[dataLength - whichIndex].date
          : dataset[dataLength - 1].date
        const endDate = date
        return endDate
      } else {
        return null
      }
    }
  },

  methods: {
    getEnergyValue(domain) {
      return this.$options.filters.formatValue(
        this.findDataPoint('energy', domain)
      )
    },
    getEmissionValue(domain) {
      return this.$options.filters.formatValue(
        this.findDataPoint('emissionVol', domain)
      )
    },
    getPriceValue(domain) {
      return this.$options.filters.formatCurrency(
        this.findDataPoint('price', domain)
      )
    },
    getTemperatureValue(domain) {
      return this.$options.filters.formatValue(
        this.findDataPoint('temperature', domain)
      )
    },
    findDataPoint(prop, domain) {
      if (!this.dataset || !this.dataset[prop]) return ''
      const find = this.dataset[prop].find(d => d.date === this.timeHovered)
      return find ? find[domain] : ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';
.summary {
  font-size: 0.8em;
}
.summary-row {
  display: flex;
  align-items: center;
  padding: 3px 4px;
  border-bottom: 1px solid #ddd;
}
.summary-header {
  .summary-row {
    font-family: $header-font-family;
    font-weight: 700;
    user-select: none;

    small {
      display: block;
    }
  }
}

.item-energy,
.item-contribution,
.item-price {
  width: 25%;
  text-align: right;
  padding: 0 5px;
}

.item-region {
  width: 30%;
  display: flex;
  align-content: center;
  text-align: left;
  .colour-square {
    display: block;
    width: 15px;
    height: 15px;
    background-color: #eee;
    margin-right: 5px;
  }
}
</style>
