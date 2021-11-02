<template>
  <div/>
</template>

<script>
import Draggable from '@/components/ui/DraggableContainer'

export default {
  components: {
    Draggable
  }
}
</script>

<style lang="scss" scoped>
.floating-palette {
  width: 300px;
  background-color: #fff;
  z-index: 9999999;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  top: 15vh;
  right: 50px;
}
</style>
