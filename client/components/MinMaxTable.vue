<template>
  <table>
    <thead>

      <tr>
        <th class="fixed-width"></th>
        <th colspan="1">Lowest</th>
        <th colspan="1">Highest</th>
      </tr>

    </thead>

    <tbody>

      <tr>
        <th class="text-left border-right">Demand <small class="unit">MW</small></th>
        <td class="hoverable" v-on:mouseover="emitHover(getMinObject('demand'))" v-on:mouseout="emitOut()">
          {{getMinValue("demand")}}
          <br>
          <small class="date">{{getMinDate("demand")}}</small>
        </td>
        <td class="hoverable" v-on:mouseover="emitHover(getMaxObject('demand'))" v-on:mouseout="emitOut()">
          {{getMaxValue("demand")}}
          <br>
          <small class="date">{{getMaxDate("demand")}}</small>
        </td>
      </tr>

      <tr>
        <th class="text-left border-right">Renewables <small class="unit">%</small></th>
        <td class="hoverable" v-on:mouseover="emitHover(getMinObject('renewables'))" v-on:mouseout="emitOut()">
          {{getMinValue("renewables")}}%
          <br>
          <small class="date">{{getMinDate("renewables")}}</small>
        </td>
        <td class="hoverable" v-on:mouseover="emitHover(getMaxObject('renewables'))" v-on:mouseout="emitOut()">
          {{getMaxValue("renewables")}}%
          <br>
          <small class="date">{{getMaxDate("renewables")}}</small>
        </td>
      </tr>

      <tr v-if="hasData('price')">
        <th class="text-left border-right">Price <small class="unit">$/MWh</small></th>
        <td class="hoverable" v-on:mouseover="emitHover(getMinObject('price'))" v-on:mouseout="emitOut()">
          ${{getMinValue("price", "0,0.00")}}
          <br>
          <small class="date">{{getMinDate("price")}}</small>
        </td>
        <td class="hoverable" v-on:mouseover="emitHover(getMaxObject('price'))" v-on:mouseout="emitOut()">
          ${{getMaxValue("price", "0,0.00")}}
          <br>
          <small class="date">{{getMaxDate("price")}}</small>
        </td>
      </tr>

      <tr v-if="hasData('temperature')">
        <th class="text-left border-right">Temperature <small class="unit">°C</small></th>
        <td class="hoverable" v-on:mouseover="emitHover(getMinObject('temperature'))" v-on:mouseout="emitOut()">
          {{getMinValue("temperature", "0,0.0")}}°C
          <br>
          <small class="date">{{getMinDate("temperature")}}</small>
        </td>
        <td class="hoverable" v-on:mouseover="emitHover(getMaxObject('temperature'))" v-on:mouseout="emitOut()">
          {{getMaxValue("temperature", "0,0.0")}}°C
          <br>
          <small class="date">{{getMaxDate("temperature")}}</small>
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
      let format = 'D MMM, h:mma';

      const d = moment(date);
      const dYear = d.year();
      const dDayOfYear = d.dayOfYear();

      const today = moment();
      const todayYear = today.year();
      const todayDayOfYear = today.dayOfYear();

      if (dYear !== todayYear) {
        format = 'D MMM YYYY, h:mma';
      } else {
        if (dDayOfYear === todayDayOfYear) {
          format = '[Today at] h:mma';
        }
      }

      return moment(date).format(format);
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
    emitHover(data) {
      EventBus.$emit('stockEventRow-hover', data.date);
    },
    emitOut() {
      EventBus.$emit('stockEventRow-out');
    },
    hasData(key) {
      return this[key] && this[key].length > 0
    },
    getMinObject(key) {
      return this.hasData(key) ? 
        this[key][0] : {};
    },
    getMaxObject(key) {
      return this.hasData(key) ? 
        this[key][1] : {};
    },
    getMinDate(key) {
      return this.hasData(key) ? 
        this.formatDate(this[key][0].date) : '';
    },
    getMinValue(key, format) {
      return this.hasData(key) ? 
        this.formatNumber(this[key][0].value, format) : '';
    },
    getMaxDate(key) {
      return this.hasData(key) ? 
        this.formatDate(this[key][1].date) : '';
    },
    getMaxValue(key, format) {
      return this.hasData(key) ? 
        this.formatNumber(this[key][1].value, format) : '';
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
  border-top: 4px double #999;
}
td,
th {
  text-align: right;
  padding: 5px;
  border-bottom: 1px solid #999;
}
.fixed-width {
  width: 272px;
}
.border-right {
  border-right: 1px solid #999;
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
@media only screen and (min-width: 960px) {
  .fixed-width {
    width: 206px;
  }
}
</style>


