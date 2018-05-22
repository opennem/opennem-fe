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
          <input type="checkbox" v-model="externalData">
          <span class="label-text">Fetch data from <strong>data.opennem</strong></span>
        </label>
      </div>
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
.button {
  float: right;
}
.label-text {
  position: relative;
  font-size: 0.9rem;
  top: 1px;
}
</style>

