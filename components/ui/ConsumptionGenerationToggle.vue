<template>
  <div class="button-group has-addons">
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
</template>

<script>
export default {
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
</style>
