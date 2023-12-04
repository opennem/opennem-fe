<template>
  <div>
    <label v-if="mobile">Contribution:</label>

    <div 
      :class="{ mobile: mobile }" 
      class="button-group has-addons">
      <div class="buttons">
        <button
          :class="{ 'is-selected': isConsumption }"
          class="button is-small"
          @click="handlePercentContributionToClick">
          Consumption
        </button>
        <button
          :class="{ 'is-selected': isGeneration }"
          class="button is-small"
          @click="handlePercentContributionToClick">
          Generation
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    mobile: {
      type: Boolean,
      default: false
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
    }
  },
  methods: {
    handlePercentContributionToClick() {
      if (this.isConsumption) {
        this.$store.dispatch('percentContributionTo', 'generation')
      } else {
        this.$store.dispatch('percentContributionTo', 'demand')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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
