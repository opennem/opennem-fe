<template>
  <div
    :style="{
      width: `${divWidth}px`,
      position: position,
    }"
    class="totals" >
    <span class="total-facilities">Facilities: <strong>{{ totalFacilities }}</strong></span>
    <span class="total-cap">Capacity: <strong>{{ totalCap | customFormatValue({ formatter: ',.0f'}) }}</strong> MW</span>
  </div>
</template>

<script>
export default {
  props: {
    position: {
      type: String,
      default: () => ''
    },
    totalFacilities: {
      type: Number,
      default: () => 0
    },
    totalCap: {
      type: Number,
      default: () => 0
    },
    divWidth: {
      type: Number,
      default: () => 0
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';

.totals {
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 89;
  background-color: #c74523;
  color: #fff;
  padding: 3px 6px;
  font-size: 10px;
  box-shadow: 0 -2px 5px rgba(100, 100, 100, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @include tablet {
    left: auto;
    right: auto;
    bottom: 26px;
  }

  strong {
    color: #fff;
    font-size: 13px;
  }

  .total-cap {
    margin-right: 9px;

    strong {
      margin-right: 1px;
    }
  }

  .total-facilities {
    margin-left: 9px;
  }
}
</style>
