<template>
  <div class="chart-options-wrapper">
    <div 
      class="chart-options"
      @click.stop="handleMenuClick"><i class="fal fa-align-left fa-fw"/></div>
    <div
      v-on-clickaway="onClickAway"
      v-show="showMenu"
      class="dropdown-menu">
      <div class="dropdown-content">
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
  data() {
    return {
      showMenu: false
    }
  },

  computed: {
    ...mapGetters({
      chartEnergyType: 'visInteract/chartEnergyType'
    })
  },

  methods: {
    handleDropdownClicked(type) {
      this.$store.commit('visInteract/chartEnergyType', type)
      // this.showMenu = false
    },
    handleMenuClick() {
      this.showMenu = !this.showMenu
    },
    onClickAway() {
      this.showMenu = false
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
    padding: 0.5rem;
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 3px 3px rgba(10, 10, 10, 0.1);
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
