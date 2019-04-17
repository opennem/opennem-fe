<template>
  <div class="generator-detail message is-primary is-small" v-if="hasGenerator">
    <div class="message-header">
      <h2>{{ generator.displayName }}</h2>
      <button class="delete" aria-label="Close generator detail" @click="handleCloseDetailButton"></button>
    </div>
    <div class="message-body">
      <div class="generator-info">
        <div>
          <h5>Station Name: <span>{{ generator.stationName }}</span></h5>
          <h5>Status:
            <span>{{ generator.status }}</span>
            <em v-if="generator.statusDate">on {{ generator.statusDate | formatDate }}</em>
          </h5>
        </div>
        <div>
          <h5>Participant: <span>{{ generator.participant }}</span></h5>
        </div>
        <div>
          <h5>Technology:
            <span v-for="(ft, ftIndex) in generator.fuelTechs" :key="ftIndex">
              {{ getFtLabel(ft) }}<span v-if="ftIndex !== generator.fuelTechs.length - 1">,</span>
            </span>
          </h5>
        </div>
        <div>
          <h5>Total Capacity: <span>{{ generator.generatorCap | formatNumber }}</span></h5>
        </div>
        <div>
          <h5>Region: <span>{{ getRegionLabel(generator.regionId) }}</span></h5>
        </div>
        <div>
          <h5>State: <span>{{ generator.location.state }}</span></h5>
        </div>
      </div>

      <table class="table is-narrow is-fullwidth is-bordered">
        <thead>
          <tr>
            <th colspan="3"></th>
            <th colspan="3">Type</th>
            <th colspan="2">Capacity</th>
          </tr>
          <tr>
            <th rowspan="2">Unit</th>
            <th rowspan="2">Technology</th>
            <th rowspan="2">First Run</th>
            <th rowspan="2">Schedule</th>
            <th rowspan="2">Start</th>
            <th rowspan="2">Dispatch</th>
            <th>Registered</th>
            <th>Max</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(unit, index) in generator.units" :key="index">
            <td>
              <div style="display: flex">
                <span class="source-colour"
                  :style="{ 
                    backgroundColor: getColour(unit.fuelTech)
                  }" />
                <span class="unit-name">{{ unit.name }}</span>
              </div>
            </td>
            <td>{{ getFtLabel(unit.fuelTech) }}</td>
            <td>{{ unit.firstRun }}</td>
            <td>{{ unit.scheduleType }}</td>
            <td>{{ unit.startType }}</td>
            <td>{{ unit.dispatchType }}</td>
            <td class="has-text-right">{{ unit.regCap | formatNumber }}</td>
            <td class="has-text-right">{{ unit.maxCap | formatNumber }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { GraphDomains } from '@/domains/graphs';
import { getRegionLabelByCode } from '@/domains/regions';
import { formatDateForDisplay } from '@/lib/formatter';

export default {
  props: {
    generator: Object,
  },

  computed: {
    hasGenerator() {
      return this.generator;
    },
  },

  filters: {
    formatDate(value) {
      return formatDateForDisplay(value);
    },
  },

  methods: {
    getFtLabel(ft) {
      const ftObj = GraphDomains[ft];
      if (ftObj) {
        return ftObj.label;
      }
      return ft ? ft : '—';
    },
    getColour(fuelTech) {
      const ftObj = fuelTech ? GraphDomains[fuelTech] : null;
      if (ftObj) {
        return ftObj.colour;
      }
      return '#fff';
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

  .source-colour {
    width: 17px;
    height: 17px;
    background-color: rgba(255,255,255,.8);
    display: inline-block;
    vertical-align: text-bottom;
    margin-right: 0.1rem;
    position: relative;
    top: 1px;
  }
  .unit-name {
    margin-left: 2px;
    display: block; 
  }
}

</style>
