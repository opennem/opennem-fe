<template>
  <div class="panel">
    <button
      class="delete close-btn is-small"
      aria-label="delete"
      @click="handleDoneClick"
    />
    <div class="panel-heading">Features</div>

    <label class="panel-block">
      <input
        v-model="featureComparePrice"
        type="checkbox"
      >
      Show Compare VWP before 2009
    </label>

  </div>
</template>

<script>
export default {
  computed: {
    featureComparePrice: {
      get: function () {
        return this.$store.getters['feature/comparePrice']
      },
      set: function (newValue) {
        this.$store.commit('feature/comparePrice', newValue)
      }
    }
  },
  watch: {
    featureComparePrice() {
      this.$emit('done')
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
  position: relative;
  font-size: 0.9em;
  max-width: 250px;
  box-shadow: 1px 1px 2px rgba(10, 10, 10, 0.1);
  border-radius: 4px;

  &::after {
    content: '';
    transform: rotate(45deg);
    background: #fff;
    bottom: -5px;
    right: 10px;
    width: 10px;
    height: 10px;
    position: absolute;
    z-index: -1;
  }

  .panel-heading {
    background-color: #f5f5f5;
    font-size: 12px;
    font-family: $header-font-family;
  }

  .close-btn {
    position: absolute;
    right: -8px;
    top: -8px;
    border: 4px solid #f5f5f5;
    min-width: 22px;
    max-width: 22px;
    min-height: 22px;
    max-height: 22px;
    background-color: #999;
  }
}
.button.is-primary {
  border: 1px solid black;
}
</style>
