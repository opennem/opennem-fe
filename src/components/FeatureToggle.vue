<template>
  <div class="container">
    <nav class="panel">
      <p class="panel-heading">
        Features
        <button class="button is-small is-link is-outlined" @click="handleDoneClicked">
          Done
        </button>
      </p>
      
      <div class="panel-block">
        <label>
          <input type="checkbox" v-model="moreDateRanges">
          <span class="label-text">Show more date range selections (energy charts)</span>
        </label>
      </div>
      <div class="panel-block">
        <label>
          <input type="checkbox" v-model="recordsTable">
          <span class="label-text">Show Records table</span>
        </label>
      </div>

      <div class="panel-block" style="border-top: 1px solid #000;">
        <label>
          <input type="checkbox" v-model="localData">
          <span class="label-text">Fetch data from <strong>local files</strong></span>
          <span class="label-text has-text-danger">* Only for local environment</span>
        </label>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  computed: {
    localData: {
      get() {
        return this.$store.getters.localData;
      },
      set(newValue) {
        this.$store.dispatch('localData', newValue);
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
.button {
  float: right;
}
.label-text {
  position: relative;
  font-size: 0.9rem;
  top: 1px;
}
</style>

