<template>
  <section>
    <div class="graph" v-for="row in rangeSummary.sourcesData" :key="row.id">
      <span class="source-colour" :style="{ backgroundColor: row.colour }"></span>
      <span class="source-label">{{row.label}}</span>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters({
      rangeSummary: 'getRangeSummary',
    }),
  },
};
</script>

<style lang="scss" scoped>
section {
  margin-top: 0;
  padding: 0 1rem;
}
.graph {
  display: inline-block;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}
.source-colour {
  width: 13px;
  height: 13px;
  background-color: rgba(255,255,255,.8);
  display: inline-block;
  vertical-align: text-bottom;
  margin-right: 0.1rem;
}
</style>

