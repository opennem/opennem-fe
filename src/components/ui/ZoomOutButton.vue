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
  right: 0;
  left: 0;
  width: 94px;
  margin: -2px auto 0;
}
</style>


