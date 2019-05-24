<template>
  <div class="facilities-toggle buttons has-addons">
    <a
      class="button is-rounded is-primary is-small"
      :class="{ 'is-inverted': this.view !== 'list' }"
      @click="onClick('list')">
      <span class="icon">
        <font-awesome-icon class="fal fa-fw" :icon="iconList" />
      </span>
    </a>
    <a
      class="button is-rounded is-primary is-small"
      :class="{ 'is-inverted': this.view !== 'map' }"
      @click="onClick('map')">
      <span class="icon">
        <font-awesome-icon class="fal fa-fw" :icon="iconMap" />
      </span>
    </a>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faMap, faList } from '@fortawesome/fontawesome-pro-light';

export default {
  components: {
    FontAwesomeIcon,
  },

  props: {
    view: String,
  },

  computed: {
    iconList() {
      return faList;
    },
    iconMap() {
      return faMap;
    },
  },

  methods: {
    onClick(view) {
      this.$emit('viewSelect', view);
    },
  },
};
</script>

<style lang="scss" scoped>
.facilities-toggle {
  .button:first-child {
    position: relative;
    left: -1px;
  }
}
</style>
