<template>
  <div class="level export-nav is-mobile">
    <div class="level-left">
      <h1>Export as Image (PNG)</h1>
    </div>
    <div class="level-right">
      <div class="buttons">
        <button class="button is-small is-rounded is-primary is-inverted" @click="closeExport">
          Cancel
        </button>
        <button class="button is-small is-rounded is-primary" @click="handleDownloadClick">
          Download
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '@/lib/event-bus';

export default {
  name: 'export-header',
  components: {
  },
  methods: {
    closeExport() {
      this.$store.dispatch('setExportPng', false);
    },
    handleDownloadClick() {
      EventBus.$emit('before.download.png');
    },
  },
};
</script>

<style lang="scss" scoped>
.export-nav {
  max-width: 650px;
}
</style>