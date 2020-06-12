<template>
  <div class="chart-options-wrapper">
    <div 
      class="chart-options" 
      @click.stop="handleMenuClick"><i class="fal fa-align-left fa-fw"/></div>
    <div
      v-show="showMenu"
      class="dropdown-menu">
      <div class="dropdown-content">
        <a
          :class="{
            'is-selected': chartEnergyType === 'area'
          }"
          class="dropdown-item"
          @click.stop="handleDropdownClicked('area')">
          Area
        </a>
        <a
          :class="{
            'is-selected': chartEnergyType === 'line'
          }"
          class="dropdown-item"
          @click.stop="handleDropdownClicked('line')">
          Line
        </a>
        <a
          :class="{
            'is-selected': chartEnergyType === 'proportion'
          }"
          class="dropdown-item"
          @click.stop="handleDropdownClicked('proportion')">
          Proportion
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
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
      this.showMenu = false
    },
    handleMenuClick() {
      console.log('click')
      this.showMenu = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
.chart-options-wrapper {
  position: relative;
}

.dropdown-menu {
  display: block;
  min-width: 40px;
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
