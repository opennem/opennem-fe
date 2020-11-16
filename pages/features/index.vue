<template>
  <div class="container">
    <div class="panel">
      <div class="panel-heading">
        Feature Toggle
      </div>
      <label class="panel-block">
        <input
          v-model="featureEmissions"
          type="checkbox">
        Emissions Charts
      </label>

      <!-- <label class="panel-block">
        <input
          v-model="featureRegionCompare"
          type="checkbox">
        Region Compare Charts
      </label> -->

      <label class="panel-block">
        <input
          v-model="featureV3Paths"
          type="checkbox">
        Use v3 paths
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
  computed: {
    featureEmissions: {
      get: function() {
        return this.$store.getters['feature/emissions']
      },
      set: function(newValue) {
        this.$store.commit('feature/emissions', newValue)
      }
    },

    featureRegionCompare: {
      get: function() {
        return this.$store.getters['feature/regionCompare']
      },
      set: function(newValue) {
        this.$store.commit('feature/regionCompare', newValue)
      }
    },

    featureV3Paths: {
      get: function() {
        return this.$store.getters['feature/v3Paths']
      },
      set: function(newValue) {
        this.$store.commit('feature/v3Paths', newValue)
      }
    }
  },
  methods: {
    handleDoneClick() {
      this.$router.go(-1)
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
