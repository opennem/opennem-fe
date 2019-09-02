<template>
  <div class="container">
    <div class="panel">
      <div class="panel-heading">
        Feature Toggle
      </div>
      <label class="panel-block">
        <input
          v-model="fEmissions"
          type="checkbox"
          @click="handleClick">
        Show Emissions Charts
      </label>

      <div class="panel-block">
        <button
          class="button is-primary is-outlined is-fullwidth"
          @click="handleDoneClick">
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { lsGet, lsSet } from '~/services/LocalStorage'

const MutationTypes = {
  FEATURE_TOGGLE_EMISSIONS: 'FEATURE_TOGGLE_EMISSIONS'
}

export default {
  data() {
    return {
      fEmissions: false
    }
  },
  mounted() {
    const featureEmissions = lsGet(MutationTypes.FEATURE_TOGGLE_EMISSIONS)
    // set up local storage
    if (featureEmissions) {
      this.$store.dispatch('featureEmissions', featureEmissions)
      this.fEmissions = featureEmissions
    } else {
      lsSet(MutationTypes.FEATURE_TOGGLE_EMISSIONS, false)
    }
  },
  methods: {
    handleClick() {
      const check = !this.fEmissions
      lsSet(MutationTypes.FEATURE_TOGGLE_EMISSIONS, check)
      this.$store.dispatch('featureEmissions', check)
    },
    handleDoneClick() {
      this.$router.push({ path: '/energy/nem' })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';
.container {
  margin-top: 1rem;
  max-width: 300px;
}
.button.is-primary {
  border: 1px solid $opennem-link-color;
}
</style>
