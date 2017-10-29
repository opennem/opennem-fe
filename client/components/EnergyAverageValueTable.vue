<template>
  <table>
    <thead>
      <tr>
        <th colspan="2"></th>
        <th colspan="3" class="instant-values">{{formatDate(dateFrom)}} — {{formatDate(dateTo)}}</th>

        <th colspan="3" class="instant-values">-</th>
      </tr>
      <tr>
        <th colspan="2"></th>
        <th class="instant-values">Energy (GWh)</th>
        <th>Power (MW)</th>
        <th>Average Value ($)</th>

        <th class="instant-values">Power (GWh)</th>
        <th>Contribution (%)</th>
        <th>Price ($)</th>
      </tr>
    </thead>
    <tbody>
       <tr v-for="item in tableData" class="active">
        <td style="width: 20px;">
          <div class="colour-sq" v-bind:style="{backgroundColor: getColour(item.id)}"></div>
        </td>
        <td>{{getLabel(item.id)}}</td>
        <td class="instant-values">{{formatNumber(item.range.energy)}}</td>
        <td>{{formatNumber(item.range.totalPower)}}</td>
        <td></td>

        <td class="instant-values"></td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
    
  </table>
</template>

<script>
import * as moment from 'moment'
import numeral from 'numeral'

import { FUEL_TECH_CONFIG } from '../utils/FuelTechConfig.js'

export default {
  props: {
  	tableData: Array,
    dateFrom: Date,
    dateTo: Date,
    priceSeries: Object,
    showTotals: Boolean
  },
  data() {
    return {}
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
      const label = FUEL_TECH_CONFIG[id] ? FUEL_TECH_CONFIG[id].label : id
      return label
    },
    getColour(id) {
      const colour = FUEL_TECH_CONFIG[id] ? FUEL_TECH_CONFIG[id].colour : '#fff'
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
    text-align: left;
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
