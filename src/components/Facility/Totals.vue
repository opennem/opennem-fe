<template>
  <div class="totals" :style="{
    width: `${divWidth}px`,
    position: position,
  }">
    <span class="total-facilities">Facilities: <strong>{{totalFacilities}}</strong></span>
    <span class="total-cap">Capacity: <strong>{{ totalCap | formatNumber }}</strong> MW</span>
  </div>
</template>

<script>
export default {
  props: {
    position: String,
    totalFacilities: Number,
    totalCap: Number,
    divWidth: Number,
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.totals {
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 89;
  background-color: #C74523;
  color: #fff;
  padding: 3px 6px;
  font-size: 10px;
  box-shadow: 0 -2px 5px rgba(100, 100, 100, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

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

  @include tablet {
    left: auto;
    right: auto;
    bottom: 29px;
  }
}
</style>
