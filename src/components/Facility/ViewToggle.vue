<template>
  <div class="facilities-toggle buttons has-addons">
    <a
      class="button is-rounded is-primary"
      :class="{ 'is-inverted': this.selected !== 'list' }"
      @click="onClick('list')">List</a>
    <a
      class="button is-rounded is-primary"
      :class="{ 'is-inverted': this.selected !== 'map' }"
      @click="onClick('map')">Map</a>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selected: 'list',
    };
  },

  methods: {
    onClick(view) {
      this.selected = view;
      this.$emit('viewSelect', view);
    },
  },
};
</script>

<style lang="scss" scoped>
.facilities-toggle {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
