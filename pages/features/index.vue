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
export default {
  data() {
    return {
      fEmissions: false,
      fCompare: false
    }
  },
  computed: {
    featureEmissions() {
      return this.$store.getters.featureEmissions
    }
  },
  mounted() {
    this.fEmissions = this.featureEmissions
  },
  methods: {
    handleClick() {
      const check = !this.fEmissions
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
