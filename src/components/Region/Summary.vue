<template>
  <table class="summary-table table is-fullwidth is-narrow is-hoverable">
    <caption></caption>
    <thead>
      <tr>
        <th class="column-header"></th>
        <th class="column-header has-text-right has-min-width">
          <div v-if="isPointHovered && isPower">
            <span>Power</span>
            <small>MW</small>
          </div>

          <div v-if="!isPower || !isPointHovered">
            <span>Energy</span>
            <small>GWh</small>
          </div>
        </th>
        <th class="column-header has-text-right has-min-width">
          <span>Contribution</span>
          <small>%</small>
        </th>
        <th class="column-header has-text-right has-min-width wider">
          <div v-if="isPointHovered && isPower">
            <span>Price</span>
            <small>$/MWh</small>
          </div>

          <div v-if="!isPower || !isPointHovered">
            <span>Av.Value</span>
            <small>$/MWh</small>
          </div>
        </th>
      </tr>
    </thead>
    <thead>
      <tr>
        <th class="row-header">Sources</th>
        <th class="cell-value">
          <div v-if="isPointHovered">
            {{ pointSummary.totalGrossPower | formatNumber }}
          </div>
          
          <div v-else>
            {{ rangeSummary.totalGrossEnergy | formatNumber('0,0.0') }}
          </div>
        </th>
        <th></th>
        <th class="cell-value">
          <div v-if="isPointHovered">
            {{ pointPrice | formatNumber('$0,0.00') }}
          </div>
          
          <div v-else>
            {{ rangeSummary.totalAveragePrice | formatNumber('$0,0.00') }}
          </div>
        </th>
      </tr>
    </thead>
    
    <tbody>
      <tr v-for="row in rangeSummary.sourcesData" :key="row.id">
        <td class="row-label">
          <span class="source-colour" :style="{ backgroundColor: row.colour }"></span>
          <span class="source-label">{{row.label}}</span>
        </td>
        <td class="cell-value">
          <div v-if="isPointHovered">
            {{ pointSummary.allData[row.id] | formatNumber }}
          </div>
          
          <div v-else>
            {{ row.range.energy | formatNumber('0,0.0') }}
          </div>
        </td>
        <td class="cell-value">
          <div v-if="isPointHovered">
            {{ getContribution(pointSummary.allData[row.id], pointSummary.totalGrossPower) | formatNumber }}<span v-if="hasValue(getContribution(pointSummary.allData[row.id], pointSummary.totalGrossPower))">%</span>
          </div>
          
          <div v-else>
            {{ getContribution(row.range.power, rangeSummary.totalGrossPower) | formatNumber }}<span v-if="hasValue(getContribution(row.range.power, rangeSummary.totalGrossPower))">%</span>
          </div>
        </td>
        <td class="cell-value">
          <div v-if="isPointHovered">
            -
          </div>
          
          <div v-else>
            {{ row.range.averagePrice | formatNumber('$0,0.00') }}
          </div>
        </td>
      </tr>
    </tbody>
    
    <thead>
      <tr>
        <th class="row-header">Loads</th>
        <th class="cell-value"></th>
        <th></th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="row in rangeSummary.loadsData" :key="row.id">
        <td class="row-label">
          <span class="source-colour"></span>
          <span class="source-label">{{row.label}}</span>
        </td>
        <td class="cell-value">
          <div v-if="isPointHovered">
            {{ pointSummary.allData[row.id] | formatNumber }}
          </div>
          
          <div v-else>
            {{ row.range.energy | formatNumber('0,0.0') }}
          </div>
        </td>
        <td class="cell-value"></td>
        <td class="cell-value">
          <div v-if="isPointHovered">
            -
          </div>
          
          <div v-else>
            {{ row.range.averagePrice | formatNumber('$0,0.00') }}
          </div>
        </td>
      </tr>
    </tbody>

    <thead>
      <tr>
        <th class="row-header">Net</th>
        <th class="cell-value">
          <div v-if="isPointHovered">
            {{ pointSummary.totalNetPower | formatNumber }}
          </div>
          
          <div v-else>
            {{ rangeSummary.totalNetEnergy | formatNumber('0,0.0') }}
          </div>
        </th>
        <th></th>
        <th></th>
      </tr>
    </thead>
  </table>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatNumberForDisplay } from '@/lib/formatter';

export default {
  name: 'region-summary',
  computed: {
    ...mapGetters({
      isPointHovered: 'isPointHovered',
      rangeSummary: 'getRangeSummary',
      pointSummary: 'getPointSummary',
      isPower: 'isPower',
    }),
    pointPrice() {
      const price =
        this.pointSummary.allData.price ||
        this.pointSummary.allData.volume_weighted_price;
      return price;
    },
  },
  methods: {
    hasValue(value) {
      return value || false;
    },
    getContribution(pointValue, total) {
      return (pointValue / total) * 100;
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

  @include desktop {
    width: 390px;
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

    @include desktop {
      min-width: 60px;
    }

    &.wider {
      min-width: 60px;

      @include desktop {
        min-width: 85px;
      }
    }
  }
}
</style>

