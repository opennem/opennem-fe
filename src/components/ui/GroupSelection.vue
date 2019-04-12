<template>
  <div class="select is-rounded is-small">
    <label>Display</label>
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
  display: flex;
  align-items: center;

  select {
    padding-top: 4px;
  }
}
</style>
