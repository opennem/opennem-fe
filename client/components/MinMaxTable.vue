<template>
  <table>
    <thead>

      <tr>
        <th style="width: 206px;"></th>
        <th colspan="1">Lowest</th>
        <th colspan="1">Highest</th>
      </tr>

    </thead>

    <tbody>

      <tr>
        <th class="text-left border-right">Demand <small class="unit">MW</small></th>
        <td class="hoverable" v-on:mouseover="emitHover(demand[0], '  Lowest ', 'demand')" v-on:mouseout="emitOut(demand[0], 'demand')">
          {{formatNumber(demand[0].value)}}
          <br>
          <small class="date">{{formatDate(demand[0].date)}}</small>
        </td>
        <td class="hoverable" v-on:mouseover="emitHover(demand[1], '  Highest ', 'demand')" v-on:mouseout="emitOut(demand[1], 'demand')">
          {{formatNumber(demand[1].value)}}
          <br>
          <small class="date">{{formatDate(demand[1].date)}}</small>
        </td>
      </tr>

      <tr>
        <th class="text-left border-right">Renewables <small class="unit">MW</small></th>
        <td class="hoverable" v-on:mouseover="emitHover(renewables[0], '  Lowest ', 'renewables')" v-on:mouseout="emitOut(renewables[0], 'renewables')">
          {{formatNumber(renewables[0].value)}}
          <br>
          <small class="date">{{formatDate(renewables[0].date)}}</small>
        </td>
        <td class="hoverable" v-on:mouseover="emitHover(renewables[1], '  Highest ', 'renewables')" v-on:mouseout="emitOut(renewables[1], 'renewables')">
          {{formatNumber(renewables[1].value)}}
          <br>
          <small class="date">{{formatDate(renewables[1].date)}}</small>
        </td>
      </tr>

      <tr>
        <th class="text-left border-right">Price <small class="unit">$/MWh</small></th>
        <td class="hoverable" v-on:mouseover="emitHover(price[0], '  Lowest ', 'price')" v-on:mouseout="emitOut(price[0], 'price')">
          {{formatNumber(price[0].value, "0,0.00")}}
          <br>
          <small class="date">{{formatDate(price[0].date)}}</small>
        </td>
        <td class="hoverable" v-on:mouseover="emitHover(price[1], '  Highest ', 'price')" v-on:mouseout="emitOut(price[1], 'price')">
          {{formatNumber(price[1].value, "0,0.00")}}
          <br>
          <small class="date">{{formatDate(price[1].date)}}</small>
        </td>
      </tr>

      <tr>
        <th class="text-left border-right">Temperature <small class="unit">°C</small></th>
        <td class="hoverable" v-on:mouseover="emitHover(temperature[0], '  Lowest ', 'temperature')" v-on:mouseout="emitOut(temperature[0], 'temperature')">
          {{formatNumber(temperature[0].value, "0,0.0")}}
          <br>
          <small class="date">{{formatDate(temperature[0].date)}}</small>
        </td>
        <td class="hoverable" v-on:mouseover="emitHover(temperature[1], '  Highest ', 'temperature')" v-on:mouseout="emitOut(temperature[1], 'temperature')">
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
import EventBus from '../utils/EventBus';

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
    },
    emitHover(data, label, panelName) {
      EventBus.$emit('stockEventRow-hover', panelName, data.date, label, data.value);
    },
    emitOut(data, panelName) {
      EventBus.$emit('stockEventRow-out', panelName, data.value);
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
.hoverable {
  cursor: pointer;
}
.hoverable:hover {
  background-color: #eee;
}
</style>


