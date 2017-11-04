<template>
  <table>
    <thead>
      <tr>
        <th colspan="2" style="text-align: left"><span v-if="!showTotals">{{series[0].date}}</span></th>
        <th>
          <span v-if="showTotals">Energy (GWh)</span>
          <span v-if="!showTotals">Power (MW)</span>
        </th>
        <th>Contribution</th>
        <th>
          <span v-if="showTotals">Average Value</span>
          <span v-if="!showTotals">Price</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in series" v-on:click="item.toggle(item)" v-bind:class="{ active: item.show }">
        <td style="width: 20px;">
          <div class="colour-sq" v-bind:style="{backgroundColor: item.colour}"></div>
        </td>
        <td style="width: 150px;">{{item.label}}</td>
        <td class="value">
          <span v-if="showTotals">{{ format(null, item.sum/12000) }} </span>
          <span v-if="!showTotals">{{ format(item.offset, item.value) }} </span>
        </td>
        <td class="value">
          <span v-if="showTotals">{{ calPercent(null,  item.sum, calTotalVol() ) }}</span>
          <span v-if="!showTotals">{{ calPercent(item.offset, item.value, calTotalVol() ) }}</span>
        </td>
        </td>
        <td class="value">
          <span v-if="showTotals">${{ format(null, item.dataPriceSum/item.sum, '0,0.00') }}</span>
          <span v-if="!showTotals">${{ format(null, price.value, '0,0.00') }}</span>
          
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2"></td>
        <td class="value">
          <span v-if="showTotals">{{ format(null, calTotalVol()/12000) }}</span>
          <span v-if="!showTotals">{{ format(null, calTotalVol()) }}</span>
        </td>
        <td class="value"></td>
        <td class="value">
          <span v-if="showTotals">${{ calTotalAveragePrice() }}</span>
          <span v-if="!showTotals">${{ format(null, price.value, '0,0.00') }}</span>
        </td>
      </tr>
      
    </tfoot>
  </table>
</template>

<script>
import numeral from 'numeral'

export default {
  props: {
  	series: Array,
    price: Object,
    showTotals: Boolean
  },
  data() {
    return {}
  },
  methods: {
    calTotalAveragePrice: function() {
      let totalDataPriceSum = 0
      let totalSum = 0
      this.series.forEach((ft) => {
        totalDataPriceSum += ft.dataPriceSum
        totalSum += ft.sum
      })
      return this.format(null, totalDataPriceSum/totalSum, '0,0.00')
    },
    calPercent: function(offset, vol, tolVol) {
      let v = offset ? vol-offset : vol
      let percent = (v / tolVol) * 100
      let formatted = numeral(percent).format('0,0')
      return `${formatted}%`
    },
    calTotalVol: function() {
      let total

      if (this.showTotals) {
        total = this.series.map(item => item.sum).reduce((a, b) => a + b, 0)
      } else {
        total = this.series.map(item => {
          if (item.offset) {
            return item.value-item.offset
          } else {
            return item.value
          }
        }).reduce((a, b) => a + b, 0)
      }
      return total
    },
    format: function(offset, number, precision) {
      let formatter = precision ? precision : '0,0'
      let num = offset ? number-offset : number
      let formatted = (num === 0 || isNaN(num)) ? '-' : numeral(num).format(formatter)
      return formatted
    }
  }
}

</script>

<style scoped>
table {
  font-size: 0.8rem;
  width: 100%;
  border-collapse: collapse;
  margin-top: 30px;

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

  tbody tr {
    cursor: pointer;
    opacity: 0.3;

    .value span {
      visibility: hidden;
    }

    &.active {
      opacity: 1;

      .value  span {
        visibility: visible;
      }
    }

    &:hover {
      background-color: #eee;
    }
  }

  tfoot {
    td {
      font-weight: bold;
      background-color: #eee;
    }
  }
}
@media only screen and (min-width: 769px) {
  table {
    width: 330px;
    flex: 0 0 330px;
    margin-top: 5px;
  }
}

@media only screen and (min-width: 1025px) {
  table {
    width: 500px;
    flex: 0 0 500px;
    margin-top: 5px;
  }
}
</style>
