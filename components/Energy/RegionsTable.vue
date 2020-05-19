<template>
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
</template>

<script>
export default {
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
    }
  },

  computed: {
    timeHovered() {
      return this.dateHovered ? this.dateHovered.getTime() : 0
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
