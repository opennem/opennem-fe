<template>
  <section class="legend">
    <div
      v-for="(domain, index) in domains"
      :key="`domain-${index}`"
      class="legend-item"
    >
      <span
        :style="{
          'background-color': domain.colour
        }"
        class="colour-square"
      />
      {{ domain.label }}
      <strong
        v-if="showPercent && (domain.contribution || domain.contribution === 0)"
      >
        {{ domain.contribution | percentageFormatNumber }}
      </strong>
    </div>

    <div
      v-for="(domain, index) in curtailmentDomains"
      :key="`curtailment-domain-${index}`"
      class="legend-item"
    >
      <span
        :style="{
          'background': `repeating-linear-gradient(-45deg, ${domain.colour}, ${domain.colour} 2px, ${domain.colour}99 2px, ${domain.colour}99 4px)`,
          'border-color': domain.colour
        }"
        class="colour-square"
      />
      {{ domain.label }} (Curtailment)
      <strong
        v-if="showPercent && (domain.contribution || domain.contribution === 0)"
      >
        {{ domain.contribution | percentageFormatNumber }}
      </strong>
    </div>

    <div 
      v-if="chartEnergyRenewablesLine" 
      class="legend-item">
      <span
        :style="{
          background: renewablesLineColour
        }"
        class="renewables-line"
      />
      Renewables
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    domains: {
      type: Array,
      default: () => []
    },
    curtailmentDomains: {
      type: Array,
      default: () => []
    },
    showPercent: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters({
      chartEnergyRenewablesLine:
        'chartOptionsPowerEnergy/chartEnergyRenewablesLine'
    }),
    renewablesLineColour() {
      return this.fuelTechGroupName === 'Renewable/Fossil' ||
        this.fuelTechGroupName === 'Flexibility'
        ? '#e34a33'
        : '#52A960'
    }
  },

  watch: {
    domains() {
      console.log('domains', this.domains)
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

    strong {
      margin-left: 6px;
      position: relative;
    }
  }
}
.colour-square {
  display: inline-block;
  border: 1px solid transparent;
  width: 15px;
  height: 15px;
  margin-right: 0.5rem;
}

.renewables-line {
  width: 15px;
  height: 3px;
  background: #ddd;
  margin-right: 5px;
}
</style>
