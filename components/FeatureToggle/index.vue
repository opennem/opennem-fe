<template>
  <div class="panel">
    <div class="panel-heading">Feature Toggle</div>
    <label class="panel-block">
      <input 
        v-model="featureEmissions" 
        type="checkbox" >
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
        type="checkbox" >
      Use v3 paths
    </label>

    <label class="panel-block">
      <input 
        v-model="featureMetrics" 
        type="checkbox" >
      Show Metrics view
    </label>

    <div class="panel-block">
      <button
        class="button is-primary is-outlined is-fullwidth"
        @click="handleDoneClick"
      >
        Done
      </button>
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
    },

    featureMetrics: {
      get: function() {
        return this.$store.getters['feature/metrics']
      },
      set: function(newValue) {
        this.$store.commit('feature/metrics', newValue)
      }
    }
  },
  methods: {
    handleDoneClick() {
      this.$emit('done')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
.panel {
  background-color: #fff;

  .panel-heading {
    background-color: #f5f5f5;
  }
}
.button.is-primary {
  border: 1px solid $opennem-link-color;
}
</style>
