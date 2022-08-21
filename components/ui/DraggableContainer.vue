<template>
  <div 
    ref="draggableContainer" 
    class="draggable-container">
    <div
      class="draggable-header"
      @touchstart="dragStart"
      @touchend="dragEnd"
      @touchmove="drag"
      @mousedown="dragStart"
      @mouseup="dragEnd"
      @mousemove="drag"
    >
      <slot name="header" />
    </div>
    <slot name="main" />
    <slot name="footer" />
  </div>
</template>

<script>
export default {
  name: 'Draggable',

  created() {
    this.active = false
    this.currentX = null
    this.currentY = null
    this.initialX = null
    this.initialY = null
    this.xOffset = 0
    this.yOffset = 0
  },

  methods: {
    dragStart(e) {
      e.preventDefault()

      if (e.type === 'touchstart') {
        this.initialX = e.touches[0].clientX - this.xOffset
        this.initialY = e.touches[0].clientY - this.yOffset
      } else {
        this.initialX = e.clientX - this.xOffset
        this.initialY = e.clientY - this.yOffset
      }

      this.active = true
    },
    dragEnd(e) {
      this.initialX = this.currentX
      this.initialY = this.currentY

      this.active = false
    },
    drag(e) {
      if (this.active) {
        e.preventDefault()

        if (e.type === 'touchmove') {
          this.currentX = e.touches[0].clientX - this.initialX
          this.currentY = e.touches[0].clientY - this.initialY
        } else {
          this.currentX = e.clientX - this.initialX
          this.currentY = e.clientY - this.initialY
        }

        this.xOffset = this.currentX
        this.yOffset = this.currentY

        this.setTranslate(this.currentX, this.currentY)
      }
    },
    setTranslate(xPos, yPos) {
      this.$refs.draggableContainer.style.transform =
        'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)'
    }
  }
}
</script>

<style>
.draggable-container {
  position: fixed;
  z-index: 10;
}
.draggable-header {
  z-index: 11;
}
</style>
