<template>
  <div class="chart-title">
    <div class="chart-label">
      <slot name="options" />
      <slot name="label-unit" />
    </div>

    <div v-if="chartShown" class="hover-date-value">
      <div class="average-value">
        <slot name="average-value" />
      </div>
      <div v-if="hasHoverDate" class="hover-date">
        <time>
          <slot name="hover-date" />
        </time>
      </div>
      <div class="hover-values">
        <slot name="hover-values" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    chartShown: {
      type: Boolean,
      default: false
    },
    hasHoverDate: {
      type: Boolean,
      default: false
    }
  }
}
</script>
