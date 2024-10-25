<template>
  <div
    :style="{
      width: `${divWidth}px`,
      position: position
    }"
    class="totals"
  >
    <span 
      class="total-facilities"
    >
      Facilities: <strong>{{ totalFacilities }}</strong>
    </span>
    <div 
      class="total-cap"
    >
      Capacity: <strong>{{ totalCap | facilityFormatNumber }}</strong>
      <span v-if="totalCap < 1">kW</span>
      <span v-else>MW</span>  

      <span v-if="showStorage">
        /
        <strong>{{ totalStorage | facilityFormatNumber }}</strong>
        <span>MWh</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    facilities: {
      type: Array,
      default: () => []
    },
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
    },
    showStorage: {
      type: Boolean,
      default: () => false
    }
  },

  computed: {
    totalStorage() {
      let totalStorageCap = 0

      if (this.showStorage) {
        this.facilities.forEach(facility => {
          if (facility.batteryStorageCap) {
            totalStorageCap += facility.batteryStorageCap
          }
        })
      } 
      return totalStorageCap
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
  background-color: #353535;
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
