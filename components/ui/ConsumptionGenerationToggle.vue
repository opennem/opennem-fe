<template>
  <div class="consumption-generation-toggle buttons has-addons">
    <span
      :class="{ 'is-selected': isConsumption }"
      class="button is-small"
      @click="handlePercentContributionToClick"
      >Consumption</span
    >
    <span
      :class="{ 'is-selected': isGeneration }"
      class="button is-small"
      @click="handlePercentContributionToClick"
      >Generation</span
    >
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
.consumption-generation-toggle {
  .button:first-child {
    position: relative;
    left: 2px;
  }
}
</style>
