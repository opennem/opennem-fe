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
        <th class="column-header has-text-right has-min-width" style="position: relative;">
          <div v-on-clickaway="onClickAway" @click="handleClick">
            <span>Contribution</span>
            <small v-if="isTypeGeneration">to generation</small>
            <small v-if="isTypeDemand">to demand</small>
          </div>

          <transition name="slide-down-fade">
            <div v-if="dropdownActive" class="dropdown-menu">
              <div class="dropdown-content">
                <a class="dropdown-item"
                    @click="handleSelection('generation')"
                    :class="{ 'selected': isTypeGeneration }">
                  Contribution to generation
                </a>
                <a class="dropdown-item"
                    @click="handleSelection('demand')"
                    :class="{ 'selected': isTypeDemand }">
                  Contribution to demand
                </a>
              </div>
            </div>
          </transition> 
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
      <tr v-for="row in rangeSummary.sourcesData" :key="row.id">
        <td class="row-label">
          <span class="source-colour" :style="{ backgroundColor: row.colour }"></span>
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
import { mapGetters } from 'vuex';
import { mixin as clickaway } from 'vue-clickaway';
import { formatNumberForDisplay } from '@/lib/formatter';
import { isRenewableFuelTech } from '@/domains/graphs';

export default {
  name: 'region-summary',
  mixins: [clickaway],
  data() {
    return {
      dropdownActive: false,
      contributionSelection: {
        type: 'generation', // or 'demand'
      },
    };
  },
  computed: {
    ...mapGetters({
      isPointHovered: 'isPointHovered',
      rangeSummary: 'getRangeSummary',
      pointSummary: 'getPointSummary',
      isPower: 'isPower',
      contributionType: 'contributionType',
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
  },
  mounted() {
    this.contributionSelection.type = this.contributionType;
  },
  methods: {
    onClickAway() {
      this.dropdownActive = false;
    },
    handleClick() {
      const isActive = !this.dropdownActive;
      this.dropdownActive = isActive;
    },
    handleSelection(type) {
      this.contributionSelection.type = type;
      this.$store.dispatch('contributionType', type);
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

  @include desktop {
    width: 410px;
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

.dropdown-menu {
  min-width: auto;
  width: 180px;
  display: block;
  font-weight: normal;
  margin-left: -50%;

  .dropdown-content {
    padding: 0;
  }

  .dropdown-item {
    font-size: 1em;
    text-align: left;
    padding: .5rem 1rem;
    font-family: $numbers-font-family;

    &:first-child {
      border-radius: 3px 3px 0 0;
    }
    &:last-child {
      border-radius: 0 0 3px 3px;
    }
  }
}

</style>

