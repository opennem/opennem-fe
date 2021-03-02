<template>
  <div class="chart-options-wrapper">
    <div
      class="chart-options-icon"
      @click.stop="handleMenuClick">
      <i class="fal fa-bars fa-fw"/>
    </div>

    <transition name="slide-down-fade">
      <div
        v-on-clickaway="onClickAway"
        v-if="show"
        class="dropdown-menu">
        <div class="dropdown-content">
          <button
            class="delete close-btn is-small"
            aria-label="delete"
            @click.stop="emitShow(false)" />

          <fieldset>
            <label>Chart</label>
            <div
              :class="{'is-chart-hidden': !chartShown}"
              class="chart-options-buttons buttons has-addons">
              <button
                v-for="type in types"
                :key="type"
                :class="{'is-selected': chartType === type}"
                class="button is-small"
                @click.stop="handleTypeClick(type)">{{ chartLabel[type] }}</button>
            </div>
          </fieldset>

          <fieldset v-if="chartShown">
            <label>Style</label>
            <div class="chart-options-buttons buttons has-addons">
              <button
                v-for="curve in curves"
                :key="curve"
                :class="{'is-selected': chartCurve === curve}"
                class="button is-small"
                @click.stop="handleCurveClick(curve)">{{ chartLabel[curve] }}</button>
            </div>
          </fieldset>

          <fieldset v-if="chartShown && showYAxisOptions && yAxes.length > 0">
            <label>Measurement</label>
            <div
              class="chart-options-buttons buttons has-addons"
              style="margin-right: 1rem;">
              <button
                v-for="yAxis in yAxes"
                :key="yAxis"
                :class="{'is-selected': chartYAxis === yAxis}"
                class="button is-small"
                @click.stop="handleYAxisClick(yAxis)">{{ chartLabel[yAxis] }}</button>
            </div>
          </fieldset>

          <fieldset v-if="chartShown && prefixes.length > 0">
            <label>Units</label>
            <div
              class="chart-options-buttons buttons has-addons"
              style="margin-right: 1rem;">
              <button
                v-for="prefix in prefixes"
                :key="prefix"
                :class="{'is-selected': chartDisplayPrefix === prefix}"
                class="button is-small"
                @click.stop="handlePrefixClick(prefix)">{{ `${unitPrefix}${prefix}${chartUnit}` }}</button>
            </div>
          </fieldset>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'
import {
  CHART_LABEL,
  CHART_LINE,
  CHART_HIDDEN
} from '@/constants/chart-options.js'

export default {
  mixins: [clickaway],

  props: {
    options: {
      type: Object,
      default: () => {
        return {
          type: [],
          curve: [],
          yAxis: []
        }
      }
    },
    chartShown: {
      type: Boolean,
      default: false
    },
    chartType: {
      type: String,
      default: ''
    },
    chartCurve: {
      type: String,
      default: ''
    },
    chartYAxis: {
      type: String,
      default: ''
    },
    showYAxisOptions: {
      type: Boolean,
      default: true
    },
    chartUnit: {
      type: String,
      default: ''
    },
    chartDisplayPrefix: {
      type: String,
      default: ''
    },
    unitPrefix: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      chartLabel: CHART_LABEL
    }
  },

  computed: {
    ...mapGetters({
      range: 'range'
    }),
    types() {
      return this.options.type
    },
    curves() {
      return this.options.curve
    },
    yAxes() {
      return this.options.yAxis || []
    },
    prefixes() {
      return this.options.si || []
    },
    isLineType() {
      return this.chartType === CHART_LINE
    }
  },

  methods: {
    handleMenuClick() {
      this.emitShow(!this.show)
    },
    onClickAway() {
      this.emitShow(false)
    },
    emitShow(show) {
      this.$emit('show-change', show)
    },
    handleTypeClick(type) {
      if (type === CHART_HIDDEN) {
        this.emitShow(false)
      }
      this.$emit('type-click', type)
    },
    handleYAxisClick(yAxis) {
      this.$emit('y-axis-click', yAxis)
    },
    handleCurveClick(curve) {
      this.$emit('curve-click', curve)
    },
    handlePrefixClick(prefix) {
      this.$emit('prefix-click', prefix)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.chart-options-wrapper {
  position: relative;
  .chart-options-buttons {
    margin-bottom: 1px;

    &:last-child,
    &.is-chart-hidden {
      margin-bottom: 0;
    }
  }

  fieldset {
    padding-bottom: 0.3rem;

    label {
      font-family: $header-font-family;
      font-weight: 700;
      padding-left: 0.1rem;
      font-size: 1.1em;
    }

    &:last-child {
      padding-bottom: 0;
    }
  }
}

.row {
  display: flex;
  justify-content: space-between;
  .buttons {
    margin-bottom: 0;
  }
}

.buttons {
  flex-wrap: nowrap;
}
.button {
  &:not(.is-selected) {
    background-color: #ece9e6;
    &:hover {
      background-color: #ededed;
    }
  }
  &.button:not(:last-child) {
    margin-right: 1px;
  }
}

.dropdown-menu {
  display: block;
  left: -10px;
  margin-top: 2px;

  &::after {
    content: '';
    transform: rotate(45deg);
    background: #fff;
    top: 0px;
    left: 7px;
    width: 10px;
    height: 10px;
    position: absolute;
    z-index: -1;
  }

  .dropdown-content {
    padding: 6px;
    box-shadow: 0 3px 3px rgba(10, 10, 10, 0.1);

    .close-btn {
      position: absolute;
      right: -8px;
      top: -3px;
      border: 4px solid #fff;
      min-width: 22px;
      max-width: 22px;
      min-height: 22px;
      max-height: 22px;
      background-color: #999;
    }
  }
}
</style>
