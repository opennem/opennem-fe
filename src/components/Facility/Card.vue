<template>
  <div class="facility-card">
    <a class="close-btn" @click="close">
      <font-awesome-icon class="fal" :icon="iconClose" />
    </a>

    <h1>{{ facility.displayName }}</h1>

    <div
      v-for="(ft, ftIndex) in facility.fuelTechs"
      :key="ftIndex"
      :style="{ 
        backgroundColor: getColour(ft),
      }"
      class="source-colour" />

    <div>
      {{ region }}
    </div>

    <div class="stat">
      <div class="stat-value" v-if="facility.genFuelTechs.length">
        <span
          v-for="(ft, genFtIndex) in facility.genFuelTechs"
          :key="genFtIndex"
        >
          {{ getFtLabel(ft) }}
          <small v-if="facility.genFuelTechs.length > 1">({{ facility.fuelTechRegisteredCap[ft] | formatNumber}}MW)</small>
          <span v-if="genFtIndex !== facility.genFuelTechs.length - 1"><br /></span>
        </span>
      </div>
      <div class="stat-value" v-if="facility.loadFuelTechs.length">
        <em
          v-for="(ft, loadFtIndex) in facility.loadFuelTechs"
          :key="loadFtIndex"
        >
          {{ getFtLabel(ft) }}
          <small>({{ facility.fuelTechRegisteredCap[ft] | formatNumber}}MW)</small>
          <span v-if="loadFtIndex !== facility.loadFuelTechs.length - 1"><br /></span>
        </em>
      </div>
    </div>

    <div class="stat">
      <div v-show="facility.generatorCap" class="stat-value">
        {{ generatorCap | formatNumber }}
        <span class="unit" v-if="generatorCap !== 0">MW</span>
      </div>
      <div v-show="!facility.generatorCap" class="stat-value">
        –
      </div>
    </div>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/fontawesome-pro-light';
import { GraphDomains } from '@/domains/graphs';
import { getRegionAbbrByCode } from '@/domains/regions';

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
        return getRegionAbbrByCode(this.facility.regionId);
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
  background-color: #fff;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}
.source-colour {
  width: 15px;
  height: 15px;
}
</style>
