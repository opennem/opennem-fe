<template>
  <div class="level export-nav is-mobile">
    <div class="level-left">
      <h1 v-if="isChrome">Export as Image (PNG)</h1>
      <h1 v-else></h1>
    </div>
    <div class="level-right">
      <div class="buttons" v-if="isChrome">
        <button class="button is-small is-rounded is-primary is-inverted" @click="closeExport">
          Cancel
        </button>
        <button class="button is-small is-rounded is-primary" @click="handleDownloadClick">
          Download
        </button>
      </div>

      <div class="buttons" v-else>
        <button class="button is-small is-rounded is-primary is-inverted" @click="closeExport">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { isChrome } from '@/lib/device';
import EventBus from '@/lib/event-bus';

export default {
  name: 'export-header',
  components: {
  },
  data() {
    return {
      isChrome: isChrome(),
    };
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