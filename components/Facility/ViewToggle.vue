<template>
  <div class="facilities-toggle buttons has-addons">
    <a
      :class="{ 'is-inverted': view !== 'list' }"
      class="button is-rounded is-primary is-small"
      @click="onClick('list')">
      <span class="icon">
        <i class="fal fa-fw fa-list" />
      </span>
    </a>
    <a
      :class="{ 'is-inverted': view !== 'map' }"
      class="button is-rounded is-primary is-small" 
      @click="onClick('map')">
      <span class="icon">
        <i class="fal fa-fw fa-map" />
      </span>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    view: {
      type: String,
      default: () => 'list'
    }
  },

  methods: {
    onClick(view) {
      this.$emit('viewSelect', view)
    }
  }
}
</script>

<style lang="scss" scoped>
.facilities-toggle {
  .button {
    min-width: 0;
  }
  .button:first-child {
    position: relative;
    left: -1px;
  }
}
</style>
