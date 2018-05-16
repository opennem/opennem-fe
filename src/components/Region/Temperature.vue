<template>
  <table class="summary-table table is-fullwidth is-narrow">
    <caption></caption>
    <thead>
      <tr>
        <th class="column-header">
          Temperature
        </th>
        <th class="column-header has-text-right has-min-width">
          <div v-if="showTemperatureRange">
            <small>°C</small>
          </div>

          <div v-else>
            <div v-if="isPointHovered" class="temperature-value">
              {{ pointTemperature | formatNumber('0,0.0') }}<span v-if="hasValue(pointTemperature)">°C</span>
            </div>
            
            <div v-else>
              -
            </div>
          </div>
        </th>
      </tr>
    </thead>

    <tbody v-if="showTemperatureRange">
      <tr>
        <td>Average</td>
        <td class="cell-value">
          <div v-if="isPointHovered">
            {{ pointTemperature | formatNumber('0,0.0') }}<span v-if="hasValue(pointTemperature)">°C</span>
          </div>
          
          <div v-else>
            -
          </div>
        </td>
      </tr>
      <tr>
        <td>Minimum</td>
        <td class="cell-value">
          <div v-if="isPointHovered">
            {{ pointTemperatureMin | formatNumber('0,0.0') }}°C
          </div>
          
          <div v-else>
            -
          </div>
        </td>
      </tr>
      <tr>
        <td>Maximum</td>
        <td class="cell-value">
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
    width: 390px;
  }

  .temperature-value {
    font-family: $numbers-font-family;
    font-weight: normal;
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

