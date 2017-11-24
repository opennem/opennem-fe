<template>
  <table>
    <thead>
      <tr>
        <th colspan="2"></th>
        <!-- range info -->
        <th class="instant-values" v-bind:colspan="showPrice ? 4 : 3">{{formatDate(dateFrom)}} — {{formatDate(dateTo)}}</th>
        <!-- point info -->
        <th class="instant-values" v-bind:colspan="showPrice ? 3 : 2">{{formatDate(pointData.date)}}</th>
      </tr>
      <tr>
        <th colspan="2"></th>

        <!-- range info -->
        <th class="instant-values">Energy (GWh)</th>
        <th>Power (MW)</th>
        <th>Contribution (%)</th>
        <th v-if="showPrice">Average Value ($)</th>

        <!-- point info -->
        <th class="instant-values">Power (MW)</th>
        <th>Contribution (%)</th>
        <th v-if="showPrice">Price ($)</th>
      </tr>
    </thead>
    <tbody>
       <tr v-for="item in tableData" class="active">
        <td style="width: 20px;">
          <div class="colour-sq" v-bind:style="{backgroundColor: getColour(item.id)}"></div>
        </td>
        <td style="text-align:left">
          <a v-if="showPrice" v-bind:href="`/#/regions/${region}/${item.id}`">{{getLabel(item.id)}}</a>
          <span v-if="!showPrice">{{getLabel(item.id)}}</span>
        </td>
      
        <!-- range info -->
        <td class="instant-values">{{formatNumber(item.range.energy)}}</td>
        <td>{{formatNumber(item.range.totalPower)}}</td>
        <td>{{formatNumber(item.range.totalPower/rangeTotal*100)}}%</td>
        <td v-if="showPrice">{{formatNumber(item.range.averagePrice, '0,0.00')}}</td>
        
        <!-- point info -->
        <td class="instant-values">{{formatNumber(pointData[item.id])}}</td>
        <td>{{formatNumber(pointData[item.id]/pointTotal*100)}}%</td>
        <td v-if="showPrice">{{formatNumber(pointData.rrp, '0,0.00')}}</td>
      </tr>
    </tbody>

    <tfoot>
      <tr>
        <td colspan="2"></td>

        <td></td>
        <td>{{formatNumber(rangeTotal)}}</td>
        <td></td>
        <td v-if="showPrice"></td>

        <td>{{formatNumber(pointTotal)}}</td>
        <td></td>
        <td v-if="showPrice"></td>
      </tr>
    </tfoot>
    
  </table>
</template>

<script>
import * as moment from 'moment'
import numeral from 'numeral'

import { FUEL_TECH } from '../utils/FuelTechConfig'

export default {
  props: {
  	tableData: Array,
    dateFrom: Date,
    dateTo: Date,
    priceSeries: Object,
    showTotals: Boolean,
    pointData: Object,
    showPrice: Boolean
  },
  data() {
    return {
      pointTotal: 0,
      rangeTotal: 0,
      region: this.$route.params.region
    }
  },
  watch: {
    tableData: function(newData) {
      let rangeTotal = 0
      newData.forEach(ft => {
        rangeTotal += ft.range.totalPower
      })
      this.rangeTotal = rangeTotal
    },
    pointData: function(newData) {
      let pointTotal = 0
      Object.keys(FUEL_TECH).forEach(ft => {
        if (newData[ft]) {
          pointTotal += newData[ft]
        }
      })
      this.pointTotal = pointTotal
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format('lll')
    },
    formatNumber: function(number, precision) {
      let formatter = precision ? precision : '0,0'
      let formatted = (number === 0 || isNaN(number)) ? '-' : numeral(number).format(formatter)
      return formatted
    },
    getLabel(id) {
      const label = FUEL_TECH[id] ? FUEL_TECH[id].label : id
      return label
    },
    getColour(id) {
      const colour = FUEL_TECH[id] ? FUEL_TECH[id].colour : '#fff'
      return colour
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

  .value {
    padding-left: 10px;
    width: 200px;
    text-align: right;
  }

  td, th {
    text-align: right;
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

.instant-values {
  border-left: 1px solid #999;
}
</style>
