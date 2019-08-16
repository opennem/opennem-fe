<template>
  <div class="facility-card">
    <a
      class="close-btn"
      @click="close">
      <i class="fal fa-times" />
    </a>

    <div style="width: 70%;">
      <div class="facility-name">
        {{ facility.displayName }}
      </div>

      <div class="fuel-tech-colour-wrapper">
        <div
          v-for="(ft, ftIndex) in facility.fuelTechs"
          :key="ftIndex"
          :style="{ 
            backgroundColor: getColour(ft),
          }"
          class="source-colour" />
      </div>
      
      <div class="region">
        {{ region }}
      </div>

      <div class="fuel-techs">
        <span
          v-for="(ft, genFtIndex) in facility.genFuelTechs"
          :key="genFtIndex"
        >
          {{ getFtLabel(ft) }}
          <small v-if="facility.genFuelTechs.length > 1">
            ({{ facility.fuelTechRegisteredCap[ft] | facilityFormatNumber }}MW)
          </small><span v-if="genFtIndex !== facility.genFuelTechs.length - 1">,</span> 
        </span>
        <span v-if="facility.loadFuelTechs.length && facility.genFuelTechs.length">,</span>
        <em
          v-for="(ft, loadFtIndex) in facility.loadFuelTechs"
          :key="loadFtIndex"
        >
          {{ getFtLabel(ft) }}
          <small>
            ({{ facility.fuelTechRegisteredCap[ft] | facilityFormatNumber }}MW)
          </small><span v-if="loadFtIndex !== facility.loadFuelTechs.length - 1">,</span>
        </em>
      </div>
    </div>

    <div class="capacity-wrapper">
      <div v-show="facility.generatorCap">
        {{ generatorCap | facilityFormatNumber }}
        <span
          v-if="generatorCap !== 0"
          class="unit">MW</span>
      </div>
      <div v-show="!facility.generatorCap">
        –
      </div>
    </div>
  </div>
</template>

<script>
import * as FUEL_TECHS from '~/constants/fuelTech.js'

export default {
  props: {
    facility: {
      type: Object,
      default: () => null
    },
    selectedTechs: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    isAvailable() {
      return this.facility
    },

    region() {
      if (this.facility) {
        return this.facility.regionId
      }
      return ''
    },

    generatorCap() {
      if (this.facility) {
        if (this.selectedTechs.length === 0) {
          return this.facility.generatorCap
        }

        const ftRegCap = this.facility.fuelTechRegisteredCap
        let cap = 0
        this.selectedTechs.forEach(d => {
          if (FUEL_TECHS.FUEL_TECH_CATEGORY[d] !== 'load' && ftRegCap[d]) {
            cap += ftRegCap[d]
          }
        })
        return cap
      }
      return ''
    }
  },

  methods: {
    getFtLabel(ft) {
      const ftLabel = FUEL_TECHS.FUEL_TECH_LABEL[ft]
      if (ftLabel) {
        if (ft === 'battery_discharging') {
          return 'Battery'
        }
        if (ft === 'solar') {
          return 'Solar'
        }
        return ftLabel
      }
      return ft || '—'
    },

    getColour(fuelTech) {
      const ftColour = FUEL_TECHS.DEFAULT_FUEL_TECH_COLOUR[fuelTech]
      return ftColour || 'transparent'
    },

    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.facility-card {
  box-shadow: -10px 0 15px rgba(100, 100, 100, 0.1);
  background-color: #fff;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 98;
  padding: 10px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .close-btn {
    position: absolute;
    top: 5px;
    right: 15px;
  }

  .facility-name {
    font-weight: 600;
  }

  .region {
    font-size: 12px;
    color: #666;
  }

  .fuel-techs {
    font-size: 12px;
    color: #000;
  }
}

.capacity-wrapper {
  font-size: 20px;

  .unit {
    font-size: 12px;
    margin-left: -2px;
  }
}

.fuel-tech-colour-wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
}
.source-colour {
  width: 15px;
  height: 100%;
}
</style>
