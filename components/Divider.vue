<template>
  <div 
    class="divider" 
    :class="{ 
      isDragging: dragging || show,
      vertical: vertical
    }"
    v-dragged="onDragged">
    <span/>
    <span/>
    <span/>
  </div>
</template>

<script>
export default {
  props: {
    allowX: {
      type: Boolean,
      default: true
    },
    allowY: {
      type: Boolean,
      default: true
    },
    show: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    }
  },  

  data() {
    return {
      dragging: false
    }
  },

  methods: {
    onDragged({ el, deltaX, deltaY, offsetX, offsetY, clientX, clientY, first, last }) {
      if (first) {
        this.dragging = true
        this.$emit('dragging', true)
        return
      }
      if (last) {
        this.dragging = false
        this.$emit('dragging', false)
        this.$emit('last-drag', false)
        return
      }

      if (this.allowX) {
        const l = +window.getComputedStyle(el)['left'].slice(0, -2) || 0
        el.style.left = l + deltaX + 'px'
      }
      if (this.allowY) {
        const t = +window.getComputedStyle(el)['top'].slice(0, -2) || 0
        el.style.top = t + deltaY + 'px'
      }

      this.$emit('dragged', {
        deltaX,
        deltaY,
        offsetX,
        offsetY,
        clientX,
        clientY,
        first,
        last
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.divider {
  cursor: ns-resize;
  display: flex;
  flex-direction: column;
  gap: 1px;

  span {
    border-top: 1px solid transparent;
    transition: border-color 0.2s ease-in-out;
    display: block;
  }

  &.vertical {
    cursor: ew-resize;
    flex-direction: row;
    padding-right: 8px;

    span {
      border-top: none;
      border-left: 1px solid transparent;
    }
  }

  &:hover, &.isDragging {
    span {
      border-color: #cdcdcd;
    }
  }
}
</style>