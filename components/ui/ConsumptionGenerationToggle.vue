<template>
  <div>
    <div v-if="mobile">
      <label>Contribution:</label>

      <div 
        :class="{ mobile: mobile }" 
        class="button-group has-addons">
        <div class="buttons">
          <button
            :class="{ 'is-selected': isConsumption }"
            class="button is-small"
            :style="{ fontSize: fontSize }"
            @click="handlePercentContributionToClick">
            Consumption
          </button>
          <button
            :class="{ 'is-selected': isGeneration }"
            class="button is-small"
            :style="{ fontSize: fontSize }"
            @click="handlePercentContributionToClick">
            Generation
          </button>
        </div>
      </div>
    </div>

    <div 
      v-else
      class="button-group">
      <div 
        :class="{ 'is-active': dropdownActive }" 
        class="dropdown">
        <button
          v-on-clickaway="handleClickAway"
          class="dropdown-trigger button inverted is-selected"
          :style="{ fontSize: fontSize }"
          @click="handleClick"
        >
          <span class="selected">
            {{ isConsumption ? 'Consumption' : 'Generation' }}
            <i
              :class="[
                'fal dropdown-trigger-icon',
                dropdownActive ? 'fa-chevron-up' : 'fa-chevron-down'
              ]"
            />
          </span>
        </button>

        <transition name="slide-down-fade">
          <div 
            v-if="dropdownActive" 
            class="filter-menu dropdown-menu">
            <div class="dropdown-content">
              <button 
                class="dropdown-item"
                :class="{ 'is-selected': isConsumption }"
                @click="() => handleOptionClick('demand')">
                Consumption
              </button>
              <button 
                class="dropdown-item"
                :class="{ 'is-selected': isGeneration }"
                @click="() => handleOptionClick('generation')">
                Generation
              </button>
            </div>
          </div>
        </transition>

      </div>
    </div>
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'

export default {
  mixins: [clickaway],
  props: {
    mobile: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      dropdownActive: false
    }
  },

  computed: {
    percentContributionTo() {
      return this.$store.getters.percentContributionTo
    },
    isConsumption() {
      return this.percentContributionTo === 'demand'
    },
    isGeneration() {
      return this.percentContributionTo === 'generation'
    },
    rangeDropdownBreak() {
      return this.$store.getters['app/rangeDropdownBreak']
    },
    fontSize() {
      return this.rangeDropdownBreak ? '12px' : '12px'
    }
  },
  methods: {
    handlePercentContributionToClick() {
      if (this.isConsumption) {
        this.$store.dispatch('percentContributionTo', 'generation')
      } else {
        this.$store.dispatch('percentContributionTo', 'demand')
      }
    },

    handleClick() {
      this.dropdownActive = !this.dropdownActive
    },

    handleOptionClick(option) {
      this.$store.dispatch('percentContributionTo', option)
    },

    handleClickAway() {
      this.dropdownActive = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

$border-radius: 8px;
.button-group .buttons {
  border-radius: $border-radius;
  .button {
    margin-right: -4px;
    border-radius: 0;

    &:first-child {
      border-top-left-radius: $border-radius;
      border-bottom-left-radius: $border-radius;
    }

    &:last-child {
      border-top-right-radius: $border-radius;
      border-bottom-right-radius: $border-radius;
    }

    &.is-selected {
      z-index: 99;
      border-radius: $border-radius;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
    }
  }
  .button:last-child {
    margin-right: 0;
  }
}

.mobile {
  .buttons {
    display: flex;
    width: 100%;
    justify-content: center;
  }

  button {
    display: flex;
    min-width: auto;
    width: 50%;
    height: auto;
    padding: 8px;
    gap: 8px;
    align-items: center;
  }
}

label {
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
  display: block;
  color: #353535;
  margin-bottom: 4px;
}
</style>
