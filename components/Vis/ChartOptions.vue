<template>
  <div class="chart-options-wrapper">
    <div 
      class="chart-options"
      @click.stop="handleMenuClick"><i class="fal fa-align-left fa-fw"/></div>
    <div
      v-on-clickaway="onClickAway"
      v-show="show"
      class="dropdown-menu">
      <div class="dropdown-content">
        <button 
          class="delete close-btn is-small" 
          aria-label="delete"
          @click.stop="emitShow(false)" />
        <div class="show-hide-buttons buttons has-addons">
          <button 
            :class="{'is-selected': chartEnergy}"
            class="button is-small is-rounded"
            @click.stop="handleShowChart">Show</button>
          <button 
            :class="{'is-selected': !chartEnergy}"
            class="button is-small is-rounded"
            @click.stop="handleHideChart">Hide</button>
        </div>

        <div class="chart-options-buttons buttons has-addons">
          <button 
            :class="{'is-selected': chartEnergyType === 'area'}"
            class="button is-small is-rounded"
            @click.stop="handleDropdownClicked('area')">Stacked</button>
          <button 
            :class="{'is-selected': chartEnergyType === 'proportion'}"
            class="button is-small is-rounded"
            @click.stop="handleDropdownClicked('proportion')">Proportion</button>
          <button 
            :class="{'is-selected': chartEnergyType === 'line'}"
            class="button is-small is-rounded"
            @click.stop="handleDropdownClicked('line')">Line</button>
          <button 
            :class="{'is-selected': chartEnergyType === 'delta'}"
            class="button is-small is-rounded"
            @click.stop="handleDropdownClicked('delta')">Delta</button>
        </div>

        <div 
          v-if="chartEnergyType === 'line'" 
          class="row" >
          <div class="chart-options-buttons buttons has-addons">
            <button class="button is-small is-rounded">Absolute</button>
            <button class="button is-small is-rounded">Percentage</button>
          </div>
          <div class="select is-rounded">
            <select @click.stop="">
              <option value="">GWh/day</option>
              <option value="">TWh/day</option>
            </select>
          </div>
        </div>

      </div>
    </div>
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
      chartEnergyType: 'visInteract/chartEnergyType'
    })
  },

  methods: {
    handleDropdownClicked(type) {
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
.chart-options-wrapper {
  position: relative;
  .chart-options-buttons {
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .show-hide-buttons {
    border-bottom: 1px solid #eee;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
  }
}

.row {
  display: flex;
  justify-content: space-between;
  .buttons {
    margin-bottom: 0;
  }
}

.select {
  width: 100%;
  margin-left: 0.5rem;
  margin-bottom: 0;
  select {
    width: 100%;
  }
}

.buttons {
  flex-wrap: nowrap;
}
.button {
  &:not(.is-selected) {
    background-color: #ece9e6;
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
    left: 12px;
    width: 10px;
    height: 10px;
    position: absolute;
    z-index: -1;
  }

  .dropdown-content {
    padding: 1rem;
    box-shadow: 0 3px 3px rgba(10, 10, 10, 0.1);

    .close-btn {
      position: absolute;
      right: 0.4rem;
      top: 0.7rem;
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
