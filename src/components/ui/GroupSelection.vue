<template>
  <div class="select is-rounded is-small">
    <select v-model="group">
      <option v-for="(g, index) in groupSelections" :key="index" :value="g">
        {{ g.groupSelectionName }}
      </option>
    </select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      group: {},
    };
  },

  computed: {
    ...mapGetters({
      groupSelections: 'groupSelections',
      groupSelected: 'groupSelected',
    }),
  },

  created() {
    this.group = this.groupSelected;
  },

  watch: {
    group(selectedGroup) {
      this.$store.dispatch('groupSelected', selectedGroup);
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
