<template>
  <div>
    <dates-display
      :start-date="startDate"
      :end-date="endDate"
      :hovered-date="timeHovered"
      :range="range"
      :interval="interval"
    />
    <group-selector />
    <table class="table is-fullwidth is-narrow is-bordered">
      <thead>
        <tr>
          <th>States</th>
          <th>Energy</th>
          <th>EV</th>
          <th>Price</th>
          <th>Temperature</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="d in domains" 
          :key="d.domain">
          <td>
            <div class="region">
              <span 
                :style="{
                  'background-color': d.colour
                }" 
                class="colour-square"/>
              <strong>{{ d.label }}</strong>
            </div>
          </td>
          <td>{{ getEnergyValue(d.domain) }}</td>
          <td>{{ getEmissionValue(d.domain) }}</td>
          <td>{{ getPriceValue(d.domain) }}</td>
          <td>{{ getTemperatureValue(d.domain) }}</td>
        </tr>
      </tbody>
    </table>
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
.table {
  font-size: 0.8em;

  .region {
    display: flex;
    align-content: center;
    .colour-square {
      display: block;
      width: 15px;
      height: 15px;
      background-color: #eee;
      margin-right: 5px;
    }
  }
}
</style>
