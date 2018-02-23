<template>
  <table>
    <thead>
      <tr>
        <!-- range info -->
        <th v-if="hidePoint" v-bind:colspan="showPrice ? 5 : 4">{{formatDate(dateFrom)}} – {{formatDate(dateTo)}}</th>
        <!-- point info -->
        <th v-if="!hidePoint" colspan="2" style="text-align: left">
          <span v-if="showPrice">
            {{formatNumber(pointData.temperature)}}<small>°C</small>
          </span>
        </th>        
        <th v-if="!hidePoint" v-bind:colspan="showPrice ? 4 : 3">{{formatDate(pointData.date)}}</th>
      </tr>
      <tr>
        <th colspan="2"></th>

        <!-- range info -->
        <th v-if="hidePoint" class="border-left" style="width: 6rem;">Energy <span class="unit">GWh</span></th>
        <th v-if="hidePoint" style="width: 6rem;">Contribution <span class="unit">%</span></th>
        <th v-if="showPrice && hidePoint" style="width: 6rem;">Av. Value <span class="unit">$/MWh</span></th>

        <!-- point info -->
        <th v-if="!hidePoint" class="border-left" style="width: 6rem;">Power <span class="unit">MW</span></th>
        <th v-if="!hidePoint" style="width: 6rem;">Contribution <span class="unit">%</span></th>
        <th v-if="showPrice && !hidePoint" style="width: 6rem;">Price <span class="unit">$</span></th>
      </tr>
    </thead>
    <tbody>
      <tr class="active totals-row">
        <td colspan="2" class="group-header">Sources</td>

        <td v-if="hidePoint" class="border-left">{{formatNumber(grossEnergyTotal, '0,0.0')}}</td>
        <td v-if="!hidePoint">{{formatNumber(grossPointTotal)}}</td>

        <td></td>

        <td v-if="showPrice && hidePoint">${{formatNumber(totalAveragePrice, '0,0.00')}}</td>
        <td v-if="showPrice && !hidePoint">${{formatNumber(pointData.price, '0,0.00')}}</td>
      </tr>
      <tr v-for="item in sourcesData" :key="item.id" class="active">
        <td style="width: 20px;">
          <div class="colour-sq" v-bind:style="{backgroundColor: getColour(item.id, item.colour)}"></div>
        </td>
        <td class="align-left" v-on:mouseover="emitDataHoverEvent(item)" v-on:mouseout="emitDataOutEvent()" style="width: 150px">
          <!-- <a v-if="showPrice" v-on:click="goToFT(item.id)">{{getLabel(item.id)}}</a>
          <span v-if="!showPrice">{{getLabel(item.id)}}</span> -->
          <span>{{getLabel(item.id)}}</span>
        </td>

        <!-- range info -->
        <td v-if="hidePoint" class="border-left">
          <span v-if="item.range.energy > 0">
            {{formatNumber(item.range.energy, '0,0.0')}}
          </span>
          <span v-else>-</span>
        </td>
        <!-- <td v-if="hidePoint">{{formatNumber(item.range.totalPower)}}</td> -->
        <td v-if="hidePoint">
          <span v-if="item.range.energy > 0">
            {{displayRangeTotalPercent(item)}}
          </span>
          <span v-else>-</span>
        </td>
        <td v-if="showPrice && hidePoint">
          <span v-if="item.range.energy > 0">
            {{formatNumber(item.range.averagePrice, '$0,0.00')}}
          </span>
          <span v-else>-</span>
        </td>

        <!-- point info -->
        <td v-if="!hidePoint" class="border-left">
          <span v-if="pointData[item.id] > 0">
            {{formatNumber(pointData[item.id])}}
          </span>
          <span v-else>-</span>
        </td>
        <td v-if="!hidePoint">
           <span v-if="pointData[item.id] > 0">
            {{displayPointTotalPercent(item)}}
          </span>
          <span v-else>-</span>
        </td>
        <td v-if="showPrice && !hidePoint"></td>
      </tr>
    </tbody>

    <tbody v-show="loadsData.length > 0">
      <tr class="active totals-row">
        <td colspan="2" class="group-header">Loads</td>
        <td colspan="3" class="border-left"></td>
      </tr>
      <tr v-for="item in loadsData" :key="item.id" class="active">
        <td style="width: 20px;">
          <div class="colour-sq" style="background: rgba(255,255,255,0.9); border: 1px solid #aaa;"></div>
        </td>
        <td class="align-left" style="width: 150px">
          <!-- <a v-if="showPrice" v-on:click="goToFT(item.id)">{{getLabel(item.id)}}</a>
          <span v-if="!showPrice">{{getLabel(item.id)}}</span> -->
          <span>{{getLabel(item.id)}}</span>
        </td>

        <!-- range info -->
        <td v-if="hidePoint" class="border-left">
          <span v-if="item.range.energy <= 0">{{formatNumber(item.range.energy, '0,0.0')}}</span>
          <span v-else>-</span>
        </td>
        <!-- <td v-if="hidePoint">{{formatNumber(item.range.totalPower)}}</td> -->
        <td v-if="hidePoint"></td>
        <td v-if="showPrice && hidePoint">
          <span v-if="item.range.energy <= 0">
            {{formatNumber(item.range.averagePrice, '$0,0.00')}}
          </span>
          <span v-else>-</span>
        </td>

        <!-- point info -->
        <td v-if="!hidePoint" class="border-left">
          <span v-if="pointData[item.id] <= 0">{{formatNumber(pointData[item.id])}}</span>
          <span v-else>-</span>
        </td>
        <td v-if="!hidePoint"></td>
        <td v-if="showPrice && !hidePoint"></td>
      </tr>
    </tbody>

    <tfoot>
      <tr class="totals-row">
        <td colspan="2" class="group-header">Net</td>

        <td v-if="hidePoint" class="border-left">{{formatNumber(netEnergyTotal, '0,0.0')}}</td>
        <!-- <td v-if="hidePoint">{{formatNumber(rangeTotal)}}</td> -->
        <td v-if="showPrice && hidePoint"></td>

        <td v-if="!hidePoint">{{formatNumber(pointTotal)}}</td>
        <td v-if="showPrice && !hidePoint"></td>

        <td></td>
      </tr>
    </tfoot>

  </table>
</template>

<script>
import * as moment from "moment";
import numeral from "numeral";
import { mapGetters } from "vuex";

import EventBus from '../utils/EventBus';
import { FUEL_TECH } from "../utils/FuelTechConfig";

export default {
  props: {
    tableData: Array,
    sourcesData: Array,
    loadsData: Array,
    totalAveragePrice: Number,
    dateFrom: Date,
    dateTo: Date,
    priceSeries: Object,
    showTotals: Boolean,
    pointData: Object,
    showPrice: Boolean,
    hidePoint: Boolean
  },
  data() {
    return {
      pointTotal: 0,
      grossPointTotal: 0,
      rangeTotal: 0,
      grossRangeTotal: 0,
      netEnergyTotal: 0,
      grossEnergyTotal: 0,
      region: this.$route.params.region
    };
  },
  computed: {
    ...mapGetters({
      regionId: "getRegionId"
    })
  },
  watch: {
    tableData: function(newData) {
      let rangeTotal = 0;
      let grossRangeTotal = 0;
      let netEnergyTotal = 0;
      let grossEnergyTotal = 0;

      newData.forEach(ft => {
        rangeTotal += ft.range.totalPower;
        grossRangeTotal += (FUEL_TECH[ft.id].type === 'sources' ? ft.range.totalPower : 0);
        netEnergyTotal += ft.range.energy;
        grossEnergyTotal += (FUEL_TECH[ft.id].type === 'sources' ? ft.range.energy : 0)
      });

      this.rangeTotal = rangeTotal;
      this.grossRangeTotal = grossRangeTotal;
      this.netEnergyTotal = netEnergyTotal;
      this.grossEnergyTotal = grossEnergyTotal;
    },
    pointData: function(newData) {
      let pointTotal = 0;
      let grossPointTotal = 0;

      Object.keys(FUEL_TECH).forEach(ft => {
        // only sum if type is a source or load
        if (FUEL_TECH[ft].type !== 'other' && newData[ft]) {
          // net total
          pointTotal += newData[ft];

          // gross total
          grossPointTotal += (FUEL_TECH[ft].type === 'sources' ? newData[ft] : 0);
        }
      });

      this.pointTotal = pointTotal;
      this.grossPointTotal = grossPointTotal;
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format("D MMM YYYY, h:mma");
    },
    formatNumber: function(number, precision, unit) {
      let formatter = precision ? precision : "0,0";
      unit = unit === undefined ? "" : unit;
      let formatted =
        number === 0 || isNaN(number)
          ? "-"
          : numeral(number).format(formatter) + unit;
      return formatted;
    },
    getLabel(id) {
      const label = FUEL_TECH[id] ? FUEL_TECH[id].label : id;
      return label;
    },
    getColour(id, itemColour) {
      let colour = "#fff";
      if (itemColour !== undefined) {
        colour = itemColour;
      } else if (FUEL_TECH[id] !== undefined) {
        colour = FUEL_TECH[id].colour;
      }
      return colour;
    },
    goToFT(ft) {
      this.$router.push({
        name: "generators",
        params: {
          region: this.regionId,
          ft: ft
        }
      });
    },
    displayRangeTotalPercent(item) {
      const value = item.range.totalPower / this.grossRangeTotal * 100;
      return this.formatNumber(
        value,
        '0,0',
        '%'
      );
    },
    displayPointTotalPercent(item) {
      const value = this.pointData[item.id] / this.grossPointTotal * 100;
      return this.formatNumber(
        value,
        '0,0',
        '%'
      );
    },
    emitDataHoverEvent(row) {
      EventBus.$emit('row-hover', row.id);
    },
    emitDataOutEvent() {
      EventBus.$emit('row-out');
    }
  }
};
</script>

<style scoped>
table {
  font-size: 0.75rem;
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid #999;

  .totals-row td {
    color: #000;
    background: #f5f1ed;
    font-weight: bold;
  }

  td.group-header {
    text-align: left;
    color: #000;
    background: #f7ece0;
    font-weight: bold;
  }

  .align-left {
    text-align: left;
  }

  .value {
    padding-left: 10px;
    width: 200px;
    text-align: right;
  }

  .unit {
    font-size: 0.9em;
    color: #777;
    font-weight: 200;
  }

  td,
  th {
    text-align: right;
    padding: 5px;
    border-bottom: 1px solid #999;
  }

  .colour-sq {
    width: 15px;
    height: 15px;
    background-color: #999;
  }

  tbody tr {
    cursor: pointer;
    opacity: 0.3;

    .value span {
      visibility: hidden;
    }

    &.active {
      opacity: 1;

      .value span {
        visibility: visible;
      }
    }

    &:hover {
      background-color: #eee;
    }
  }

  tfoot {
    td {
      font-weight: bold;
      background-color: #eee;
    }
  }
}

.border-left {
  border-left: 1px solid #999;
}
</style>
