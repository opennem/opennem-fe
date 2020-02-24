<template>
  <div class="column-selector-wrapper">
    <div
      v-on-clickaway="handleClickAway"
      :class="{ 'has-hover': isEnergyChart }"
      class="column-selector"
      @touchstart="handleTouchstart"
      @touchend="handleTouchend"
      @mousedown="handleMousedown"
      @mouseup="handleMouseup"
      @mouseout="handleMouseout">
      <span v-if="isAvValueColumn">
        Av.Value <small>$/MWh</small>
      </span>
      <span v-if="isEmissionsVolumeColumn">
        Emissions Volume <small>tCO₂e</small>
      </span>
      <span v-if="isEmissionsIntensityColumn">
        Emissions Intensity <small>kgCO₂e/MWh</small>
      </span>
    </div>
    <div
      v-show="showMenu"
      class="show-column-menu dropdown-menu">
      <div class="dropdown-content">
        <a
          v-for="(g, index) in groups"
          :key="index"
          :class="{
            'is-selected': g.id === selected
          }"
          class="dropdown-item"
          @click="handleDropdownClicked(g.id)">
          {{ g.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'

const groups = [
  {
    id: 'av-value',
    label: 'Av. Value'
  },
  {
    id: 'emissions-volume',
    label: 'Emissions Volume'
  },
  {
    id: 'emissions-intensity',
    label: 'Emissions Intensity'
  }
]

export default {
  mixins: [clickaway],
  data() {
    return {
      groups,
      selected: groups[0].id,
      showMenu: false,
      mousedownDelay: null,
      longPress: 500
    }
  },

  computed: {
    showSummaryColumn() {
      return this.$store.getters.showSummaryColumn
    },

    isAvValueColumn() {
      return this.showSummaryColumn === 'av-value'
    },

    isEmissionsVolumeColumn() {
      return this.showSummaryColumn === 'emissions-volume'
    },

    isEmissionsIntensityColumn() {
      return this.showSummaryColumn === 'emissions-intensity'
    },

    energyChartType() {
      return this.$store.getters.energyChartType
    },

    isEnergyChart() {
      return this.energyChartType === 'energy'
    }
  },

  watch: {
    selected(newValue) {
      this.handleDropdownClicked(newValue)
    },
    showSummaryColumn(group) {
      this.selected = group
    }
  },

  mounted() {
    this.selected = this.showSummaryColumn
  },

  methods: {
    handleDropdownClicked(selectedId) {
      this.$store.dispatch('showSummaryColumn', selectedId)
      this.showMenu = false
    },
    handleClickAway() {
      this.showMenu = false
      this.clearTimeout()
    },
    handleMousedown() {
      if (this.isEnergyChart) {
        this.mousedownDelay = setTimeout(() => {
          this.showMenu = true
        }, this.longPress)
      }
    },
    handleMouseup() {
      if (this.isEnergyChart && !this.showMenu) {
        switch (this.selected) {
          case 'av-value':
            this.selected = 'emissions-volume'
            break
          case 'emissions-volume':
            this.selected = 'emissions-intensity'
            break
          default:
            this.selected = 'av-value'
            break
        }
      }
      this.clearTimeout()
    },
    handleTouchstart() {
      if (this.isEnergyChart) {
        this.mousedownDelay = setTimeout(() => {
          this.showMenu = true
        }, this.longPress)
      }
    },
    handleTouchend() {
      this.clearTimeout()
    },
    handleMouseout() {
      this.clearTimeout()
    },
    clearTimeout() {
      clearTimeout(this.mousedownDelay)
      this.mousedownDelay = null
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.column-selector-wrapper {
  position: relative;
  user-select: none;

  .column-selector {
    padding: 0 4px;
    &.has-hover {
      cursor: pointer;
      &:hover {
        background-color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}
.show-column-menu {
  display: block;
  right: -5px;
  left: auto;
  min-width: 40px;
  .dropdown-item {
    font-family: $family-primary;
    font-weight: normal;
    border-radius: 0;
    min-width: 40px;
    text-align: right;
    padding-right: 1rem;
    &.is-selected {
      background-color: $opennem-link-color;
      color: #fff;
    }
  }
}
</style>
