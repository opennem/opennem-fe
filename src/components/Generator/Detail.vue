<template>
  <div class="generator-detail message is-primary is-small" v-if="hasGenerator">
    <div class="message-header">
      <h2>{{ generator.stationName }}</h2>
      <button class="delete" aria-label="Close generator detail" @click="handleCloseDetailButton"></button>
    </div>
    <div class="message-body">
      <div class="generator-info">
        <div>
          <h5>Fuel Tech:
            <span v-for="(ft, ftIndex) in generator.fuelTechs" :key="ftIndex">
              {{ getFtLabel(ft) }}
            </span>
          </h5>
        </div>
        <div>
          <h5>Total Capacity: <span>{{ generator.generatorCap | formatNumber }}</span></h5>
        </div>
        <div>
          <h5>Region: <span>{{ getRegionLabel(generator.regionId) }}</span></h5>
        </div>
      </div>

      <table class="table is-narrow is-fullwidth">
        <thead>
          <tr>
            <th>Unit</th>
            <th>First Run</th>
            <th class="has-text-right">Capacity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(unit, index) in generator.units" :key="index">
            <td>{{ unit.name }}</td>
            <td>{{ unit.firstRun }}</td>
            <td class="has-text-right">{{ unit.regCap | formatNumber }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { GraphDomains } from '@/domains/graphs';
import { getRegionLabelByCode } from '@/domains/regions';

export default {
  props: {
    generator: Object,
  },

  computed: {
    hasGenerator() {
      return this.generator;
    },
  },

  methods: {
    getFtLabel(ft) {
      const ftObj = GraphDomains[ft];
      if (ftObj) {
        return ftObj.label;
      }
      return ft;
    },
    getRegionLabel(code) {
      return getRegionLabelByCode(code);
    },
    handleCloseDetailButton() {
      this.$emit('closeGeneratorDetail');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.generator-detail {
  // margin-left: 10px;
  margin-top: 10px;
  // margin-bottom: 10px;
  border-radius: 6px;
  box-shadow: 0 0 20px rgba(0,0,0,.05);

  .message-header {
    border-radius: 6px 6px 0 0;
    h2 {
      font-family: $header-font-family;
      font-size: 1.5em;
    }
  }

  .message-body {
    border-radius: 0 0 6px 6px;
    height: 100%;
    padding: 0;
    border: none;
  }

  .generator-info {
    padding: 10px;

    span {
      font-weight: bold;
    }
  }
  .table {
    background: transparent;
    margin-bottom: 0;
  }
}
</style>
