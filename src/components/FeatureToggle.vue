<template>
  <div class="container">
    <nav class="panel">
      <p class="panel-heading">
        Features
      </p>
      
      <div class="panel-block">
        <label>
          <input type="checkbox" v-model="externalData">
          Fetch data from <strong>data.opennem</strong>
        </label>
      </div>
      <div class="panel-block">
        <label>
          <input type="checkbox" v-model="moreDateRanges">
          Show more date range selections (energy charts)
        </label>
      </div>
      <div class="panel-block">
        <label>
          <input type="checkbox" v-model="recordsTable">
          Show Records table
        </label>
      </div>

      <div class="panel-block">
        <button class="button is-link is-outlined is-fullwidth" @click="handleDoneClicked">
          Done
        </button>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  computed: {
    externalData: {
      get() {
        return this.$store.getters.externalData;
      },
      set(newValue) {
        this.$store.dispatch('externalData', newValue);
      },
    },
    moreDateRanges: {
      get() {
        return this.$store.getters.moreDateRanges;
      },
      set(newValue) {
        this.$store.dispatch('moreDateRanges', newValue);
      },
    },
    recordsTable: {
      get() {
        return this.$store.getters.recordsTable;
      },
      set(newValue) {
        this.$store.dispatch('recordsTable', newValue);
      },
    },
  },
  methods: {
    handleDoneClicked() {
      this.$router.push({ name: 'home' });
    },
  },
};
</script>


<style lang="scss" scoped>
.container {
  padding: 0 1rem;
  width: 500px;
}
</style>

