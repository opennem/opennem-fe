<template>
  <header>
    <div class="chart-title">
      {{ title }}
    </div>

    <div 
      v-if="tooltipValues"
      class="chart-hover-values">
        
      <div class="datetime">
        <time>{{ tooltipValues.date }}</time>
      </div>
      <div class="value">
        {{ tooltipValues.value | formatValue }}
      </div>
    </div>
    <div 
      v-else 
      class="chart-hover-values">
      <!-- <div class="datetime">
          <time>28 Aug 2023, 8pm</time>
        </div>
        <div class="value">
          1234
        </div> -->
    </div>
  </header>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    tooltipValues: {
      type: Object,
      default: () => null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

$radius: 4px;
$hover-padding: 3px 6px 2px;

.chart-title {
  font-size: 13px;
  font-family: $header-font-family;
  font-weight: bold;
}

.chart-hover-values {
  display: flex;
  font-size: 10px;
  justify-content: flex-end;
  align-content: center;
  height: 20px;
  font-weight: bold;

  .datetime {
    background-color: rgba(199, 69, 35, 0.1);
    border-radius: $radius 0 0 $radius;
    padding: $hover-padding;
  }
  .value {
    background-color: #fff;
    border-radius: 0 $radius $radius 0;
    padding: $hover-padding;
  }
}
</style>