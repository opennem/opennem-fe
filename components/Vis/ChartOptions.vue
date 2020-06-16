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

          <div class="chart-options-buttons buttons has-addons">
            <button 
              :class="{'is-selected': !chartEnergy}"
              class="button is-small"
              @click.stop="handleHiddenClick">Hidden</button>
            <button 
              :class="{'is-selected': chartEnergyType === 'area'}"
              class="button is-small"
              @click.stop="handleDropdownClick('area')">Stacked</button>
            <button 
              :class="{'is-selected': chartEnergyType === 'proportion'}"
              class="button is-small"
              @click.stop="handleDropdownClick('proportion')">Proportion</button>
            <button 
              :class="{'is-selected': chartEnergyType === 'line'}"
              class="button is-small"
              @click.stop="handleDropdownClick('line')">Line</button>
              <!-- <button 
            :class="{'is-selected': chartEnergyType === 'delta'}"
            class="button is-small"
            @click.stop="handleDropdownClick('delta')">Delta</button> -->
          </div>

          <div class="row">
            <div
              v-if="chartEnergyType === 'line'"
              class="chart-options-buttons buttons has-addons" 
              style="margin-right: 1rem;">
              <button 
                :class="{'is-selected': chartEnergyYAxis === 'absolute'}" 
                class="button is-small"
                @click.stop="handleYAxisClick('absolute')">Absolute</button>
              <button 
                :class="{'is-selected': chartEnergyYAxis === 'percentage'}" 
                class="button is-small"
                @click.stop="handleYAxisClick('percentage')">Percentage</button>
            </div>
            <div
              v-if="chartEnergyType === 'area' || chartEnergyType === 'proportion'"
              class="chart-options-buttons buttons has-addons">
              <button 
                :class="{'is-selected': chartEnergyCurve === 'smooth'}" 
                class="button is-small"
                @click.stop="handleCurveClick('smooth')">Smooth</button>
              <button 
                :class="{'is-selected': chartEnergyCurve === 'step'}" 
                class="button is-small"
                @click.stop="handleCurveClick('step')">Step</button>
            </div>
          <!-- <div
            v-if="chartEnergyType === 'line' || chartEnergyType === 'area'"
            class="chart-options-buttons buttons has-addons">
            <button class="button is-small">GWh</button>
            <button class="button is-small">TWh</button>
          </div> -->
          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'

export default {
  mixins: [clickaway],

  props: {
    show: {
      type: Boolean,
      default: () => false
    }
  },

  computed: {
    ...mapGetters({
      chartEnergy: 'visInteract/chartEnergy',
      chartEnergyType: 'visInteract/chartEnergyType',
      chartEnergyYAxis: 'visInteract/chartEnergyYAxis',
      chartEnergyCurve: 'visInteract/chartEnergyCurve'
    })
  },

  methods: {
    handleDropdownClick(type) {
      this.$store.commit('visInteract/chartEnergyType', type)
    },
    handleMenuClick() {
      this.emitShow(!this.show)
    },
    onClickAway() {
      this.emitShow(false)
    },
    emitShow(show) {
      this.$emit('show-change', show)
    },
    handleShowChart() {
      this.$store.commit('visInteract/chartEnergy', true)
    },
    handleHideChart() {
      this.$store.commit('visInteract/chartEnergy', false)
      this.$emit('show-change', false)
    },
    handleHiddenClick() {
      this.$store.commit('visInteract/chartEnergy', !this.chartEnergy)
    },
    handleYAxisClick(type) {
      this.$store.commit('visInteract/chartEnergyYAxis', type)
    },
    handleCurveClick(curve) {
      this.$store.commit('visInteract/chartEnergyCurve', curve)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.chart-options-wrapper {
  position: relative;
  .chart-options-buttons {
    margin-bottom: 0.7rem;

    &:last-child {
      margin-bottom: 0;
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
  width: 312px;

  &::after {
    content: '';
    transform: rotate(45deg);
    background: #fff;
    top: 0px;
    left: 12px;
    width: 10px;
    height: 10px;
    position: absolute;
    z-index: -1;
  }

  .dropdown-content {
    padding: 1rem 1.8rem 1rem 1rem;
    box-shadow: 0 3px 3px rgba(10, 10, 10, 0.1);

    .close-btn {
      position: absolute;
      right: 5px;
      top: 8px;
    }
  }

  .dropdown-item {
    font-family: $family-primary;
    font-weight: normal;
    border-radius: 0;
    min-width: 40px;
    padding-right: 1rem;
    &.is-selected {
      background-color: $opennem-link-color;
      color: #fff;
    }
  }
}
</style>
