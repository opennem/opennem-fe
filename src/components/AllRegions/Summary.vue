<template>
  <table class="summary-table table is-fullwidth is-narrow is-hoverable">
    <thead>
      <tr>
        <th></th>
        <th class="column-header has-text-right" style="width: 95px;">
          <div v-if="isPointHovered">
            <span>Power</span>
            <small>MW</small>
          </div>

          <div v-else>
            <span>Energy</span>
            <small>GWh</small>
          </div>
        </th>
        <th class="column-header has-text-right">
          <span>Contribution</span>
          <small>%</small>
        </th>
      </tr>
    </thead>
    <thead>
      <tr>
        <th class="row-header">Sources</th>
        <th class="cell-value">
          <div v-if="isPointHovered">
            {{formatNumber(pointSummary.totalGrossPower)}}
          </div>
          
          <div v-else>
            {{formatNumber(rangeSummary.totalGrossEnergy, '0,0.0')}}
          </div>
        </th>
        <th></th>
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
            {{formatNumber(pointSummary.allData[row.id])}}
          </div>
          
          <div v-else>
            {{formatNumber(row.range.energy, '0,0.0')}}
          </div>
        </td>
        <td class="cell-value">
          <div v-if="isPointHovered">
            {{formatNumber(pointSummary.allData[row.id]/pointSummary.totalGrossPower*100)}}%
          </div>
          
          <div v-else>
            {{formatNumber(row.range.power/rangeSummary.totalGrossPower*100)}}%
          </div>
        </td>
      </tr>
    </tbody>
    
    <thead>
      <tr>
        <th class="row-header">Loads</th>
        <th class="cell-value"></th>
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
            {{formatNumber(pointSummary.allData[row.id])}}
          </div>
          
          <div v-else>
            {{formatNumber(row.range.energy, '0,0.0')}}
          </div>
        </td>
        <td class="cell-value"></td>
      </tr>
    </tbody>

    <thead>
      <tr>
        <th class="row-header">Net</th>
        <th class="cell-value">
          <div v-if="isPointHovered">
            {{formatNumber(pointSummary.totalNetPower)}}
          </div>
          
          <div v-else>
            {{formatNumber(rangeSummary.totalNetEnergy, '0,0.0')}}
          </div>
        </th>
        <th></th>
      </tr>
    </thead>
  </table>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatNumberForDisplay } from '@/lib/formatter';

export default {
  name: 'all-regions-summary',
  props: {
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      isPointHovered: 'isPointHovered',
      rangeSummary: 'getRangeSummary',
      pointSummary: 'getPointSummary',
    }),
  },
  watch: {
    rangeSummary() {
    },
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    formatNumber(value, format) {
      return formatNumberForDisplay(value, format);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.summary-table {
  width: 100%;

  @include desktop {
    width: 330px
  }
  @include widescreen {
    width: 360px;
  }
  .cell-value {
    padding-left: 1em;
  }
}
</style>

