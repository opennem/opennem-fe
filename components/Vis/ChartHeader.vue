<template>
  <div class="chart-title">
    <div class="chart-label">
      <slot name="options" />
      <slot name="label-unit"/>
    </div>
    
    <div class="hover-date-value">
      <div class="average-value">
        <slot name="average-value" />
      </div>
      <div class="hover-date">
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
