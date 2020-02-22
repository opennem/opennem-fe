<template>
  <div class="column-selector-wrapper">
    <div
      v-on-clickaway="handleClickAway"
      class="column-selector"
      @click="showMenu = true">
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
      showMenu: false
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
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.column-selector-wrapper {
  position: relative;
  cursor: pointer;

  .column-selector {
    padding: 0 4px;
    &:hover {
      background-color: rgba(255, 255, 255, 0.7);
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
