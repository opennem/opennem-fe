<template>
  <table class="summary-table legend-table table is-narrow">
    <tbody>
      <tr v-for="row in rangeSummary.sourcesData" :key="row.id">
        <td class="row-label">
          <span class="source-colour" :style="{ backgroundColor: row.colour }"></span>
          <span class="source-label">{{row.label}}</span>
        </td>
      </tr>
    </tbody>
  </table>
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
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.summary-table {
  background-color: #fff;
}
</style>

