<template>
  <div class="facility-card">
    <a class="close-btn" @click="close">
      <font-awesome-icon class="fal" :icon="iconClose" />
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
            ({{ facility.fuelTechRegisteredCap[ft] | facilityFormatNumber}}MW)
          </small><span v-if="genFtIndex !== facility.genFuelTechs.length - 1">,</span> 
        </span>
        <span v-if="facility.loadFuelTechs.length && facility.genFuelTechs.length">,</span>
        <em
          v-for="(ft, loadFtIndex) in facility.loadFuelTechs"
          :key="loadFtIndex"
        >
          {{ getFtLabel(ft) }}
          <small>
            ({{ facility.fuelTechRegisteredCap[ft] | facilityFormatNumber}}MW)
          </small><span v-if="loadFtIndex !== facility.loadFuelTechs.length - 1">,</span>
        </em>
      </div>
    </div>

    <div class="capacity-wrapper">
      <div v-show="facility.generatorCap">
        {{ generatorCap | facilityFormatNumber }}
        <span class="unit" v-if="generatorCap !== 0">MW</span>
      </div>
      <div v-show="!facility.generatorCap">
        –
      </div>
    </div>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/fontawesome-pro-light';
import { GraphDomains } from '@/domains/graphs';
import { getRegionLabelByCode } from '@/domains/regions';

export default {
  components: {
    FontAwesomeIcon,
  },

  props: {
    facility: Object,
  },

  computed: {
    iconClose() {
      return faTimes;
    },

    isAvailable() {
      return this.facility;
    },

    facilitySelectedTechs() {
      return this.$store.getters.facilitySelectedTechs;
    },

    region() {
      if (this.facility) {
        return getRegionLabelByCode(this.facility.regionId);
      }
      return '';
    },

    generatorCap() {
      if (this.facility) {
        if (this.facilitySelectedTechs.length === 0) {
          return this.facility.generatorCap;
        }

        const ftRegCap = this.facility.fuelTechRegisteredCap;
        let cap = 0;
        this.facilitySelectedTechs.forEach((d) => {
          if (GraphDomains[d].type !== 'loads' && ftRegCap[d]) {
            cap += ftRegCap[d];
          }
        });
        return cap;
      }
      return '';
    },
  },

  methods: {
    getFtLabel(ft) {
      const ftObj = GraphDomains[ft];
      if (ftObj) {
        if (ft === 'battery_discharging') {
          return 'Battery';
        }
        if (ft === 'solar') {
          return 'Solar';
        }
        return ftObj.label;
      }
      return ft || '—';
    },

    getColour(fuelTech) {
      const ftObj = fuelTech ? GraphDomains[fuelTech] : null;
      if (ftObj) {
        return ftObj.colour;
      }
      return 'transparent';
    },

    close() {
      this.$emit('close');
    },
  },
};
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
