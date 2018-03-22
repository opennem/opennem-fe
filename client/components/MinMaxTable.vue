<template>
  <table>
    <thead>

      <tr>
        <th style="width: 206px;"></th>
        <th colspan="1">Minimum</th>
        <th colspan="1">Maximum</th>
      </tr>

    </thead>

    <tbody>

      <tr>
        <th class="text-left border-right">Demand <small class="unit">MW</small></th>
        <td>
          {{formatNumber(demand[0].value)}}
          <br>
          <small class="date">{{formatDate(demand[0].date)}}</small>
        </td>
        <td>
          {{formatNumber(demand[1].value)}}
          <br>
          <small class="date">{{formatDate(demand[1].date)}}</small>
        </td>
      </tr>

      <tr>
        <th class="text-left border-right">Renewables <small class="unit">MW</small></th>
        <td>
          {{formatNumber(renewables[0].value)}}
          <br>
          <small class="date">{{formatDate(renewables[0].date)}}</small>
        </td>
        <td>
          {{formatNumber(renewables[1].value)}}
          <br>
          <small class="date">{{formatDate(renewables[1].date)}}</small>
        </td>
      </tr>

      <tr>
        <th class="text-left border-right">Price <small class="unit">$/MWh</small></th>
        <td>
          ${{formatNumber(price[0].value, "0,0.00")}}
          <br>
          <small class="date">{{formatDate(price[0].date)}}</small>
        </td>
        <td>
          ${{formatNumber(price[1].value, "0,0.00")}}
          <br>
          <small class="date">{{formatDate(price[1].date)}}</small>
        </td>
      </tr>

      <tr>
        <th class="text-left border-right">Temperature <small class="unit">°C</small></th>
        <td>
          {{formatNumber(temperature[0].value, "0,0.0")}}
          <br>
          <small class="date">{{formatDate(temperature[0].date)}}</small>
        </td>
        <td>
          {{formatNumber(temperature[1].value, "0,0.0")}}
          <br>
          <small class="date">{{formatDate(temperature[1].date)}}</small>
        </td>
      </tr>

    </tbody>
  </table>
</template>

<script>
import * as moment from 'moment';
import numeral from 'numeral';

export default {
  props: {
    demand: Array,
    renewables: Array,
    temperature: Array,
    price: Array
  },
  methods: {
    formatDate(date) {
      return moment(date).format("D MMM YYYY, h:mma");
    },
    formatNumber: function(number, precision, unit) {
      let formatter = precision ? precision : "0,0";
      unit = unit === undefined ? "" : unit;
      let formatted =
        number === 0 || isNaN(number)
          ? "-"
          : numeral(number).format(formatter) + unit;
      return formatted;
    }
  }
}
</script>

<style scoped>
table {
  margin-top: -1px;
  font-size: 0.75rem;
  width: 100%;
  border-collapse: collapse;
  border-top: 4px double #aaa;
}
td,
th {
  text-align: right;
  padding: 5px;
  border-bottom: 1px solid #aaa;
}
.border-right {
  border-right: 1px solid #aaa;
}
.text-left {
  text-align: left;
}
.unit,
.date  {
  font-size: 0.8em;
  color: #777;
  font-weight: 200;
}
</style>


