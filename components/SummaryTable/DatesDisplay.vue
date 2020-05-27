<template>
  <header>
    <span v-if="!isHovering && !focusOn">
      <time>
        {{ startDate | customFormatDate({ range, interval, isStart: true }) }}
      </time>
      –
      <time>
        {{ endDate | customFormatDate({ range, interval, showYear: true, isEnd: true }) }}
      </time>
    </span>
      
    <time v-if="isHovering || focusOn">
      {{ hoveredDate | customFormatDate({ range, interval, showIntervalRange: true }) }}
    </time>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    hoverOn: {
      type: Boolean,
      default: () => false
    },
    focusOn: {
      type: Boolean,
      default: () => false
    },
    startDate: {
      type: Number,
      default: () => 0
    },
    endDate: {
      type: Number,
      default: () => 0
    },
    hoveredDate: {
      type: Number,
      default: () => 0
    },
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    }
  },

  computed: {
    ...mapGetters({
      isHovering: 'visInteract/isHovering'
    })
  }
}
</script>

<style lang="scss" scoped>
header {
  text-align: right;
  font-size: 16px;
  font-weight: 300;
  color: #000;
  padding-bottom: 1rem / 5;
  border-bottom: 1px solid #000;
  user-select: none;
}
</style>
