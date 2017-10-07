<template>
  <table>
    <thead>
      <tr>
        <th colspan="3">
          <span v-if="showTotals">Total</span>
          <span v-if="!showTotals">{{series[0].date}}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in series">
        <td>
          <div class="colour-sq" v-bind:style="{backgroundColor: item.colour}"></div>
        </td>
        <td>{{item.label}}</td>
        <td class="value">
          <span v-if="showTotals">{{item.sum.toFixed(2)}}</span>
          <span v-if="!showTotals">{{item.value}}</span>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2">Total Volume</td>
        <td class="value">{{totalVol.toFixed(2)}}</td>
      </tr>
      <tr>
        <td colspan="2">{{price.label}}</td>
        <td class="value">
          <span v-if="showTotals">${{price.sum.toFixed(2)}}</span>
          <span v-if="!showTotals">${{price.value}}</span>
        </td>
      </tr>
      <tr>
        <td colspan="2">Total Revenue</td>
        <td class="value">
          <span v-if="showTotals">${{calTotalRev(price.sum)}}</span>
          <span v-if="!showTotals">${{calTotalRev(price.value)}}</span>
        </td>
      </tr>
      <tr>
        <td colspan="2">Average Price</td>
        <td class="value">${{averagePrice(totalRev, totalVol)}}</td>
      </tr>
    </tfoot>
  </table>
</template>

<script>
export default {
  props: {
  	series: Array,
    price: Object,
    showTotals: Boolean
  },
  data() {
    return {
      totalRev: 0,
      totalVol: 0,
    }
  },
  watch: {
    series: {
      handler: function(fuelType) {
        this.totalVol = this.showTotals ? 
          fuelType.map(item => item.sum).reduce((a, b) => a + b, 0) :
          fuelType.map(item => item.value).reduce((a, b) => a + b, 0)
      },
      deep: true
    }
  },
  methods: {
    calTotalRev: function(currentPrice) {
      this.totalRev = (currentPrice * this.totalVol)
      return this.totalRev.toFixed(2)
    },
    averagePrice: function(rev, vol) {
      return (rev/vol).toFixed(2)
    }
  }
}

</script>

<style scoped>
table {
  font-size: 0.8rem;
  width: 400px;
  flex: 0 0 400px;
  border-collapse: collapse;
  margin-top: 5px;

  thead th, .value { text-align: right }

  .value {
    padding-left: 10px;
    width: 200px;
  }

  td, th {
    padding: 5px;
    border-bottom: 1px solid #999;
  }

  .colour-sq {
    width: 15px;
    height: 15px;
    background-color: #999;
  }
}
</style>
