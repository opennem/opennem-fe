<template>
  <div class="select is-rounded is-small">
    <select v-model="panels">
      <option v-for="(p, index) in panelsSelection" :key="index" :value="p">
        {{ p.label }}
      </option>
    </select>
  </div>
</template>


<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      panels: {},
    };
  },

  computed: {
    ...mapGetters({
      panelsSelection: 'panelsSelection',
      panelsSelected: 'panelsSelected',
    }),
  },

  created() {
    this.panels = this.panelsSelected;
  },

  watch: {
    panels(selected) {
      this.$store.dispatch('panelsSelected', selected);
    },
  },
};
</script>

<style lang="scss" scoped>
.select  {
  &:hover::after {
    border-color:#C74523;
  }

  select {
    background-color: rgba(255, 255, 255, 0.4);
    border: none;
    font-weight: 600;

    &:hover {
      background-color: #fff;
    }
  }
}
</style>
