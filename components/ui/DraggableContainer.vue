<template>
  <div 
    ref="draggableContainer" 
    class="draggable-container">
    <div 
      class="draggable-header" 
      @mousedown="dragMouseDown">
      <slot name="header"/>
    </div>
    <slot name="main"/>
    <slot name="footer"/>
  </div>
</template>

<script>
export default {
  name: 'DraggableDiv',
  data: function() {
    return {
      positions: {
        clientX: undefined,
        clientY: undefined,
        movementX: 0,
        movementY: 0
      }
    }
  },
  methods: {
    dragMouseDown: function(event) {
      event.preventDefault()
      // get the mouse cursor position at startup:
      this.positions.clientX = event.clientX
      this.positions.clientY = event.clientY
      document.onmousemove = this.elementDrag
      document.onmouseup = this.closeDragElement
    },
    elementDrag: function(event) {
      event.preventDefault()
      this.positions.movementX = this.positions.clientX - event.clientX
      this.positions.movementY = this.positions.clientY - event.clientY
      this.positions.clientX = event.clientX
      this.positions.clientY = event.clientY
      // set the element's new position:
      this.$refs.draggableContainer.style.top =
        this.$refs.draggableContainer.offsetTop -
        this.positions.movementY +
        'px'
      this.$refs.draggableContainer.style.left =
        this.$refs.draggableContainer.offsetLeft -
        this.positions.movementX +
        'px'
    },
    closeDragElement() {
      document.onmouseup = null
      document.onmousemove = null
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
