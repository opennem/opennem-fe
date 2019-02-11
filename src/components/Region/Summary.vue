<template>
  <table class="summary-table table is-fullwidth is-narrow is-hoverable">
    <caption>
      Summary
    </caption>
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
        <th class="column-header has-text-right has-min-width clickable" @click="toggleContributionType">
          <span>Contribution</span>
          <small v-if="isTypeGeneration">to generation</small>
          <small v-if="isTypeDemand">to demand</small>
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
        <th class="cell-value" :class="{ 'hovered': isPointHovered }">
          <div v-if="isPointHovered">
            <span v-if="isPower">
              {{ pointSummary.totalGrossPower | formatNumber }}
            </span>
            <span v-else>
              {{ pointSummary.totalGrossPower | formatNumber('0,0.0') }}
            </span>
          </div>
          
          <div v-else>
            {{ rangeSummary.totalGrossEnergy | formatNumber('0,0.0') }}
          </div>
        </th>
        <th></th>
        <th class="cell-value" :class="{ 'hovered': isPointHovered }">
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
      <tr 
        v-for="row in rangeSummary.sourcesData"
        :key="row.id"
      >
        <td
          class="row-label"
          @click.exact="handleSourceRowClicked(row.id)"
          @click.shift.exact="handleSourceRowShiftClicked(row.id)"
        >
          <span class="source-colour" 
            :style="{ 
              backgroundColor: isDisabled(row.id) ? 'transparent' : row.colour,
              border: `1px solid ${isDisabled(row.id) ? '#ccc' : row.colour}`
            }"></span>
          <span class="source-label">{{row.label}}</span>
        </td>
        <td class="cell-value" :class="{ 'hovered': isPointHovered }">
          <div v-if="isPointHovered">
            <span v-if="isPower">
              {{ pointSummary.allData[row.id] | formatNumber }}
            </span>
            <span v-else>
              {{ pointSummary.allData[row.id] | formatNumber('0,0.0') }}
            </span>
          </div>
          
          <div v-else>
            {{ row.range.energy | formatNumber('0,0.0') }}
          </div>
        </td>
        <td class="cell-value" :class="{ 'hovered': isPointHovered }">
          <div v-if="isPointHovered">
            {{ getContribution(pointSummary.allData[row.id], pointSummaryTotal) | formatNumber('0,0.0') }}<span v-if="hasValue(getContribution(pointSummary.allData[row.id], pointSummaryTotal))">%</span>
          </div>
          
          <div v-else>
            {{ getContribution(row.range.power, rangeSummaryTotal) | formatNumber('0,0.0') }}<span v-if="hasValue(getContribution(row.range.power, rangeSummaryTotal))">%</span>
          </div>
        </td>
        <td class="cell-value" :class="{ 'hovered': isPointHovered }">
          <div v-if="isPointHovered">
            {{ pointSummary.allData[`${row.id}.market_value`] / Math.abs(pointSummary.allData[`${row.id}`]) / 1000 | formatNumber('$0,0.00') }}
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
      <tr 
        v-for="row in rangeSummary.loadsData"
        :key="row.id"
        @click.exact="handleSourceRowClicked(row.id)"
        @click.shift.exact="handleSourceRowShiftClicked(row.id)"
      >
        <td class="row-label">
          <span class="source-colour"
            :style="{ 
              backgroundColor: isDisabled(row.id) ? 'transparent' : row.colour,
              border: `1px solid ${isDisabled(row.id) ? '#ccc' : row.colour}`
            }"></span>
          <span class="source-label">{{row.label}}</span>
        </td>
        <td class="cell-value" :class="{ 'hovered': isPointHovered }">
          <div v-if="isPointHovered">
            {{ pointSummary.allData[row.id] | formatNumber }}
          </div>
          
          <div v-else>
            {{ row.range.energy | formatNumber('0,0.0') }}
          </div>
        </td>
        <td class="cell-value" :class="{ 'hovered': isPointHovered && isTypeDemand }">
          <div v-if="isPointHovered && isTypeDemand">
            {{ getContribution(pointSummary.allData[row.id], pointSummaryTotal) | formatNumber('0,0.0') }}<span v-if="hasValue(getContribution(pointSummary.allData[row.id], pointSummaryTotal))">%</span>
          </div>
          
          <div v-if="!isPointHovered && isTypeDemand">
            {{ getContribution(row.range.power, rangeSummaryTotal) | formatNumber('0,0.0') }}<span v-if="hasValue(getContribution(row.range.power, rangeSummaryTotal))">%</span>
          </div>
        </td>
        <td class="cell-value" :class="{ 'hovered': isPointHovered }">
          <div v-if="isPointHovered">
            {{ pointSummary.allData[`${row.id}.market_value`] / Math.abs(pointSummary.allData[`${row.id}`]) / 1000 | formatNumber('$0,0.00') }}
          </div>
          
          <div v-else>
            {{ row.range.averagePrice | formatNumber('$0,0.00') }}
          </div>
        </td>
      </tr>
    </tbody>

    <thead>
      <tr class="row-separator">
        <th class="row-header">Net</th>
        <th class="cell-value" :class="{ 'hovered': isPointHovered }">
          <div v-if="isPointHovered">
            <span v-if="isPower">
              {{ pointSummary.totalNetPower | formatNumber }}
            </span>
            <span v-else>
              {{ pointSummary.totalNetPower | formatNumber('0,0.0') }}
            </span>
          </div>
          
          <div v-else>
            {{ rangeSummary.totalNetEnergy | formatNumber('0,0.0') }}
          </div>
        </th>
        <th></th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      <tr class="row-separator">
        <th class="row-header">Renewables</th>
        <th></th>
        <th class="cell-value" :class="{ 'hovered': isPointHovered }">{{ getRenewableContribution() | formatNumber('0,0.0') }}%</th>
        <th></th>
      </tr>
    </tbody>
  </table>
</template>

<script>
import * as _ from 'lodash';
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';
import { formatNumberForDisplay } from '@/lib/formatter';
import { GraphDomains, isRenewableFuelTech } from '@/domains/graphs';

export default {
  name: 'region-summary',
  props: {
    region: String,
  },
  data() {
    return {
      contributionSelection: {
        type: 'generation', // or 'demand'
      },
      disabledRows: [],
    };
  },
  computed: {
    ...mapGetters({
      isPointHovered: 'isPointHovered',
      rangeSummary: 'getRangeSummary',
      pointSummary: 'getPointSummary',
      isPower: 'isPower',
      contributionType: 'contributionType',
      currentRange: 'currentRange',
      exportRegion: 'exportRegion',
      disabledSeries: 'disabledSeries',
    }),
    isTypeGeneration() {
      return this.contributionSelection.type === 'generation';
    },
    isTypeDemand() {
      return this.contributionSelection.type === 'demand';
    },
    pointPrice() {
      const price =
        this.pointSummary.allData.price ||
        this.pointSummary.allData.volume_weighted_price;
      return price;
    },
    pointSummaryTotal() {
      return this.isTypeGeneration ?
        this.pointSummary.totalGrossPower :
        this.pointSummary.totalNetPower;
    },
    rangeSummaryTotal() {
      return this.isTypeGeneration ?
        this.rangeSummary.totalGrossPower :
        this.rangeSummary.totalNetPower;
    },
  },
  watch: {
    contributionSelection(newValue) {
      this.$store.dispatch('contributionType', newValue.type);
    },
    disabledSeries(newData) {
      this.disabledRows = newData;
    },
  },
  mounted() {
    this.contributionSelection.type = this.contributionType;
    this.disabledRows = this.disabledSeries;
  },
  methods: {
    toggleContributionType() {
      let type = 'generation';
      if (this.isTypeGeneration) {
        type = 'demand';
      }

      this.contributionSelection.type = type;
      this.$store.dispatch('contributionType', type);
    },
    handleSelection(type) {
      this.contributionSelection.type = type;
      this.$store.dispatch('contributionType', type);
    },

    handleSourceRowClicked(id) {
      const keysNum = Object.keys(GraphDomains).length;
      const find = _.findIndex(this.disabledRows, r => r === id);
      let show = false;

      if (find > -1) {
        this.disabledRows.splice(find, 1);
        show = true;
      } else {
        this.disabledRows.push(id);
      }

      if (this.disabledRows.length === keysNum) {
        // if all rows are unselected, then reset all
        this.disabledRows = [];
        EventBus.$emit('chart.series.showAll');
      } else {
        EventBus.$emit('chart.series.toggle', id, show);
      }

      this.$store.dispatch('disabledSeries', this.disabledRows);
    },

    handleSourceRowShiftClicked(id) {
      this.disabledRows = Object.keys(GraphDomains).filter(d => d !== id);

      this.$store.dispatch('disabledSeries', this.disabledRows);
      EventBus.$emit('chart.series.showOnly', id);
    },

    isDisabled(rowId) {
      return this.disabledRows.find(r => r === rowId);
    },

    hasValue(value) {
      return value || false;
    },
    getContribution(pointValue, total) {
      return (pointValue / total) * 100;
    },
    getRenewableContribution() {
      let renewContribution = 0;

      if (this.rangeSummary.sourcesData) {
        this.rangeSummary.sourcesData.forEach((d) => {
          if (isRenewableFuelTech(d.id)) {
            if (this.isPointHovered) {
              renewContribution +=
                this.getContribution(
                  this.pointSummary.allData[d.id],
                  this.pointSummaryTotal,
                );
            } else {
              renewContribution +=
                this.getContribution(d.range.power, this.rangeSummaryTotal);
            }
          }
        });
      }
      return renewContribution;
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
  margin-bottom: 0;

  tr td span.source-colour {
    cursor: pointer;
  }

  @include desktop {
    width: 430px;
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

.clickable {
  cursor: pointer;

  &:hover {
    background-color: #fff;
  }
}
</style>

