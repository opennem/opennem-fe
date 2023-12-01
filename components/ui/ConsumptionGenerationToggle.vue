<template>
  <div class="button-group has-addons">
    <div class="buttons">
      <button
        :class="{ 'is-selected': isConsumption }"
        class="button is-small"
        @click="handlePercentContributionToClick"
      >Consumption</button
      >
      <button
        :class="{ 'is-selected': isGeneration }"
        class="button is-small"
        @click="handlePercentContributionToClick"
      >Generation</button
      >
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
.button-group .buttons {
  .button {
    margin-right: -1px;

    &.is-selected {
      z-index: 99;
    }
  }
  .button:last-child {
    margin-right: 0;
  }
}
</style>
