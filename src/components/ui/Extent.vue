<template>
  <table class="summary-table table is-fullwidth is-narrow">
    <caption>Records</caption>
    <thead>
      <tr>
        <th></th>
        <th class="has-text-right">Min.</th>
        <th class="has-text-right">Max.</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>Demand <small>MW</small></th>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMinObject('demand'))" 
          @mouseout="emitOut">
          {{ getMinValue("demand") | formatNumber }} MW
          <br>
          <small class="date-value">{{ getMinDate("demand") | formatDate(regionOffset) }}</small>
        </td>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMaxObject('demand'))" 
          @mouseout="emitOut">
          {{ getMaxValue("demand") | formatNumber }} MW
          <br>
          <small class="date-value">{{ getMaxDate("demand") | formatDate(regionOffset) }}</small>
        </td>
      </tr>

      <tr class="dark-border">
        <th>Renewables <small>%</small></th>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMinObject('renewables'))" 
          @mouseout="emitOut">
          {{ getMinValue("renewables") | formatNumber }}%
          <br>
          <small class="date-value">{{ getMinDate("renewables") | formatDate(regionOffset) }}</small>
        </td>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMaxObject('renewables'))" 
          @mouseout="emitOut">
          {{ getMaxValue("renewables") | formatNumber }}%
          <br>
          <small class="date-value">{{ getMaxDate("renewables") | formatDate(regionOffset) }}</small>
        </td>
      </tr>

      <tr>
        <th>Generation <small>MW</small></th>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMinObject('generation'))" 
          @mouseout="emitOut">
          {{ getMinValue("generation") | formatNumber }} MW
          <br>
          <small class="date-value">{{ getMinDate("generation") | formatDate(regionOffset) }}</small>
        </td>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMaxObject('generation'))" 
          @mouseout="emitOut">
          {{ getMaxValue("generation") | formatNumber }} MW
          <br>
          <small class="date-value">{{ getMaxDate("generation") | formatDate(regionOffset) }}</small>
        </td>
      </tr>

      <tr class="dark-border">
        <th>Renewables <small>%</small></th>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMinObject('renewables2'))" 
          @mouseout="emitOut">
          {{ getMinValue("renewables2") | formatNumber }}%
          <br>
          <small class="date-value">{{ getMinDate("renewables2") | formatDate(regionOffset) }}</small>
        </td>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMaxObject('renewables2'))" 
          @mouseout="emitOut">
          {{ getMaxValue("renewables2") | formatNumber }}%
          <br>
          <small class="date-value">{{ getMaxDate("renewables2") | formatDate(regionOffset) }}</small>
        </td>
      </tr>

      <tr v-if="showPrice">
        <th>Price <small>$/MWh</small></th>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMinObject('price'))" 
          @mouseout="emitOut">
          {{ getMinValue("price") | formatNumber('$0,0.00') }}
          <br>
          <small class="date-value">{{ getMinDate("price") | formatDate(regionOffset) }}</small>
        </td>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMaxObject('price'))" 
          @mouseout="emitOut">
          {{ getMaxValue("price") | formatNumber('$0,0.00') }}
          <br>
          <small class="date-value">{{ getMaxDate("price") | formatDate(regionOffset) }}</small>
        </td>
      </tr>

      <tr v-if="showTemperature">
        <th>Temperature <small>°C</small></th>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMinObject('temperature'))" 
          @mouseout="emitOut">
          {{ getMinValue("temperature") | formatNumber('0,0.0') }}°C
          <br>
          <small class="date-value">{{ getMinDate("temperature") | formatDate(regionOffset) }}</small>
        </td>
        <td class="cell-value hoverable" 
          @mouseover="emitHover(getMaxObject('temperature'))" 
          @mouseout="emitOut">
          {{ getMaxValue("temperature") | formatNumber('0,0.0') }}°C
          <br>
          <small class="date-value">{{ getMaxDate("temperature") | formatDate(regionOffset) }}</small>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';
import { getRegionOffset } from '@/domains/regions';
import { formatNumberForDisplay, formatDateForDisplay } from '@/lib/formatter';

export default {
  name: 'region-extent',
  props: {
    showTemperature: Boolean,
    showPrice: Boolean,
  },
  computed: {
    ...mapGetters({
      isPointHovered: 'isPointHovered',
      rangeSummary: 'getRangeSummary',
    }),
    regionOffset() {
      return getRegionOffset(this.$route.params.region);
    },
    demand() {
      return this.rangeSummary.demandExtent;
    },
    renewables() {
      return this.rangeSummary.renewablesExtent;
    },
    generation() {
      return this.rangeSummary.generationExtent;
    },
    renewables2() {
      return this.rangeSummary.renewablesExtent2;
    },
    price() {
      return this.rangeSummary.priceExtent;
    },
    temperature() {
      return this.rangeSummary.temperatureExtent;
    },
  },
  filters: {
    formatNumber(value, format) {
      return value ? formatNumberForDisplay(value, format) : '';
    },
    formatDate(value, offset) {
      return formatDateForDisplay(value, offset);
    },
  },
  methods: {
    emitHover(data) {
      EventBus.$emit('extent.event.hover', data.date);
    },
    emitOut() {
      EventBus.$emit('extent.event.out');
    },
    hasData(key) {
      return this[key] && this[key].length > 0;
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
        this[key][0].date : '';
    },
    getMinValue(key) {
      return this.hasData(key) ?
        this[key][0].value : '';
    },
    getMaxDate(key) {
      return this.hasData(key) ?
        this[key][1].date : '';
    },
    getMaxValue(key) {
      return this.hasData(key) ?
        this[key][1].value : '';
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.summary-table {
  width: 100%;

  th {
    font-family: $header-font-family;
    color: #444;
  }

  small {
    color: #888;
  }

  .cell-value {
    padding-left: 1em;
  }
  .hoverable {
    &:hover {
      background-color: #fff;
    }
  }
}

.dark-border {
  th, td {
    border-color: #bbb;
  }
}
</style>

