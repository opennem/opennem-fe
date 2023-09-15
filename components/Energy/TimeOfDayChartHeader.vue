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
        <span
          v-if="tooltipValues.fuelTechColour"
          :style="{ 'background-color': tooltipValues.fuelTechColour }"
          class="colour-square"
        />
        <span 
          v-if="tooltipValues.fuelTech" 
          style="font-weight: 400;">{{ tooltipValues.fuelTech }}</span>
        <span>{{ tooltipValues.value | formatValue }}</span>
      </div>
    </div>
    <div 
      v-else 
      class="chart-hover-values">
      <div>Av. {{ averageValue }}</div>
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
    },
    averageValue: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

$radius: 4px;
$hover-padding: 3px 6px 2px;

header {
  display: flex;
  justify-content: space-between;
  padding-top: 2px;
  margin-bottom: 2px;
}

.colour-square {
  display: inline-block;
  border: 1px solid transparent;
  width: 10px;
  height: 10px;
  border-radius: 1px;
  position: relative;
  top: 1px;
}

.chart-title {
  font-size: 13px;
  font-family: $header-font-family;
  font-weight: bold;
}

.chart-hover-values {
  display: flex;
  font-size: 10px;
  justify-content: flex-end;
  align-items: flex-end;
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