<template>
  <header>
    <time v-if="isHovering">
      {{
        hoveredTime
      }}
    </time>

    <span v-if="!isHovering">
      <time>
        {{ startDate | customFormatDate({ range, interval, isStart: true }) }}
      </time>
      –
      <time>
        {{
          endDate
            | customFormatDate({ range, interval, showYear: true, isEnd: true })
        }}
      </time>
    </span>

    <small>
      {{ timezoneString }}
    </small>
  </header>
</template>

<script>
export default {
  props: {
    isHovering: {
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
    hoveredTime: {
      type: String,
      default: ''
    },
    
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    },
    timezoneString: {
      type: String,
      default: () => ''
    }
  }
}
</script>

<style lang="scss" scoped>
header {
  text-align: right;
  font-size: 14px;
  font-weight: 300;
  color: #000;
  padding-bottom: 1rem / 5;
  border-bottom: 1px solid #000;
  user-select: none;

  small {
    font-size: 0.8em;
  }
}
</style>
