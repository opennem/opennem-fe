<template>
  <div class="totals" :style="{ width: `${divWidth}px`}">
    <span>Facilities: <strong>{{totalFacilities}}</strong></span>
    <span>Capacity: <strong>{{ totalCap | formatNumber }}</strong> </span>
  </div>
</template>

<script>
export default {
  props: {
    totalFacilities: Number,
    totalCap: Number,
    divWidth: Number,
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";

.totals {
  position: fixed;
  bottom: 0;
  z-index: 89;
  background-color: #C74523;
  color: #fff;
  padding: 3px 6px;
  border-radius: 3px 3px 0 0;
  font-size: 10px;
  box-shadow: 0 -2px 5px rgba(100, 100, 100, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  strong {
    color: #fff;
    font-size: 13px;
  }

  @include desktop {
    bottom: 29px;
  }
}
</style>
