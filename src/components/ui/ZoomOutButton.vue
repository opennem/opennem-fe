<template>
  <div class="zoom-out-btn">
    <button class="button is-small is-rounded is-primary is-inverted" 
      @click="handleZoomOutClicked" 
    >Zoom Out</button>
  </div>
</template>

<script>
import EventBus from '@/lib/event-bus';

export default {
  methods: {
    handleZoomOutClicked() {
      EventBus.$emit('chart.zoomedOut.clicked');
    },
  },
};
</script>

<style lang="scss" scoped>
.zoom-out-btn {
  position: absolute;
  z-index: 9;
  right: 5px;
  top: 7px;
}
</style>


