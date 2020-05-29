<template>
  <span class="hover-container">
    <em
      :style="{ 'background-color': colour }"
      class="colour-square" />
    {{ label }}
    <strong>{{ value }} {{ unit }}</strong>
  </span>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: () => ''
    },
    value: {
      type: Number,
      default: () => 0
    },
    unit: {
      type: String,
      default: () => ''
    },
    colour: {
      type: String,
      default: () => ''
    }
  }
}
</script>

<style lang="scss" scoped>
$gap: 3px;
.hover-container {
  margin-right: 1rem;
  display: flex;
  align-items: center;
  .colour-square {
    margin-right: $gap;
  }
  strong {
    margin-left: $gap;
  }
}
</style>
