<template>
  <section class="legend">
    <div
      v-for="(domain, index) in legendItems"
      :key="`domain-${index}`"
      class="legend-item">
      <span
        :style="{
          'background-color': domain.colour
        }"
        class="colour-square" />
      {{ domain.label }}
    </div>
  </section>
</template>

<script>
import _includes from 'lodash.includes'

export default {
  props: {
    domains: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    hiddenFuelTechs: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    legendItems() {
      return this.domains.filter(
        domain => !_includes(this.hiddenFuelTechs, domain.fuelTech)
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.legend {
  display: flex;
  flex-wrap: wrap;
  margin: 0 1rem;
  font-size: 11px;

  .legend-item {
    width: 33%;
    display: flex;
    align-items: center;
    padding: 0.1rem;
  }
}
.colour-square {
  display: inline-block;
  border: 1px solid transparent;
  width: 15px;
  height: 15px;
  margin-right: 0.5rem;
}
</style>
