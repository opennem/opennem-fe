<template>
  <div
    :style="{ 'left': `${leftPosition}px` }"
    class="tooltip">
    <div
      v-if="hoverValue"
      class="tooltip-value">
      <span
        :style="{ 'background-color': hoverDomainColour}"
        class="colour-square" />
      {{ hoverValue | formatValue }}
    </div>  
    <div class="tooltip-total">
      Total: {{ hoverTotal | formatValue }}
    </div>        
  </div>
</template>

<script>
export default {
  props: {
    leftPosition: {
      type: Number,
      default: () => 0
    },
    hoverValue: {
      type: Number,
      default: () => 0
    },
    hoverTotal: {
      type: Number,
      default: () => 0
    },
    hoverDomainColour: {
      type: String,
      default: () => '#000'
    }
  }
}
</script>

<style lang="scss" scoped>
.tooltip {
  font-size: 0.7rem;
  background-color: rgba(255, 255, 255, 1);
  position: absolute;
  z-index: 9;
  // top: 26px;
  // left: 30px;
  // margin-left: 10px;
  text-align: right;
  bottom: 0;
  right: 0;
  padding: 5px 6px 2px;
}
.colour-square {
  display: inline-block;
  width: 10px;
  height: 10px;
  position: relative;
  top: 1px;
}
</style>
