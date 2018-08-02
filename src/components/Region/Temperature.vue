<template>
  <table class="summary-table table is-fullwidth is-narrow">
    <thead>
      <tr class="row-separator">
        <th class="column-header" style="width: 172px; font-size: 1em; color: #363636;">
          <div v-if="!showTemperatureRange">Temperature <small>°C</small></div>
        </th>
        <th class="column-header has-text-right has-min-width" v-if="showTemperatureRange">
          Min.
        </th>
        <th class="column-header has-text-right has-min-width" v-if="showTemperatureRange">
          Av.
        </th>
        <th class="column-header has-text-right has-min-width" v-if="showTemperatureRange">
          Max.
        </th>
        <th class="column-header has-text-right has-min-width" v-if="!showTemperatureRange"></th>
        <th class="column-header has-text-right has-min-width" v-if="!showTemperatureRange"></th>
        <th class="column-header has-text-right has-min-width"
          :class="{ 'hovered': isPointHovered }" v-if="!showTemperatureRange">
          <div v-if="isPointHovered" class="temperature-value">
            {{ pointTemperature | formatNumber('0,0.0') }}<span v-if="hasValue(pointTemperature)">°C</span>
          </div>
          
          <div v-else>
            -
          </div>
        </th>
      </tr>
    </thead>

    <tbody v-if="showTemperatureRange">
      <tr>
        <th>
          Temperature <small>°C</small>
        </th>
        <td class="cell-value" :class="{ 'hovered': isPointHovered }">
          <div v-if="isPointHovered">
            {{ pointTemperatureMin | formatNumber('0,0.0') }}°C
          </div>
          
          <div v-else>
            -
          </div>
        </td>
        
        <td class="cell-value" :class="{ 'hovered': isPointHovered }">
          <div v-if="isPointHovered">
            {{ pointTemperature | formatNumber('0,0.0') }}<span v-if="hasValue(pointTemperature)">°C</span>
          </div>
          
          <div v-else>
            -
          </div>
        </td>
        
        <td class="cell-value" :class="{ 'hovered': isPointHovered }">
          <div v-if="isPointHovered">
            {{ pointTemperatureMax | formatNumber('0,0.0') }}°C
          </div>
          
          <div v-else>
            -
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatNumberForDisplay } from '@/lib/formatter';

export default {
  name: 'region-temperature',
  props: {
    showTemperatureRange: Boolean,
  },
  computed: {
    ...mapGetters({
      isPointHovered: 'isPointHovered',
      pointSummary: 'getPointSummary',
      isPower: 'isPower',
    }),
    hasAllData() {
      return this.pointSummary.allData;
    },
    pointTemperature() {
      const temperature =
        this.pointSummary.allData.temperature ||
        this.pointSummary.allData.temperature_mean;
      return temperature;
    },
    pointTemperatureMin() {
      const temperature =
        this.pointSummary.allData.temperature_min ||
        '';
      return temperature;
    },
    pointTemperatureMax() {
      const temperature =
        this.pointSummary.allData.temperature_max ||
        '';
      return temperature;
    },
  },
  methods: {
    hasValue(value) {
      return value || false;
    },
  },
  filters: {
    formatNumber(value, format) {
      return formatNumberForDisplay(value, format);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

.summary-table {
  width: 100%;

  @include widescreen {
    width: 410px;
  }

  th {
    font-family: $header-font-family;
    color: #444;
  }

  small {
    color: #888;
    display: inline !important;
  }

  .temperature-value {
    font-family: $numbers-font-family;
    font-size: 1.1em;
  }

  .cell-value {
    padding-left: 0em;

    @include desktop {
      padding: .25em .5em;
      padding-left: 1em;
    }
  }

  .has-min-width {
    min-width: 70px;
  }
}
</style>

