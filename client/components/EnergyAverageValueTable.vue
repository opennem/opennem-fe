<template>
  <table>
    <thead>
      <tr>
        <th colspan="2"></th>
        <!-- range info -->
        <th class="instant-values" v-if="hidePoint" v-bind:colspan="showPrice ? 3 : 2">{{formatDate(dateFrom)}} — {{formatDate(dateTo)}}</th>
        <!-- point info -->
        <th class="instant-values" v-if="!hidePoint" v-bind:colspan="showPrice ? 3 : 2">{{formatDate(pointData.date)}}</th>
      </tr>
      <tr>
        <th colspan="2"></th>

        <!-- range info -->
        <th v-if="hidePoint" class="instant-values" style="width: 120px">Energy (GWh)</th>
        <!-- <th v-if="hidePoint">Power (MW)</th> -->
        <th v-if="hidePoint" style="width: 130px">Contribution (%)</th>
        <th v-if="showPrice && hidePoint" style="width: 150px">Average Value ($)</th>

        <!-- point info -->
        <th v-if="!hidePoint" class="instant-values" style="width: 120px">Power (MW)</th>
        <th v-if="!hidePoint" style="width: 130px">Contribution (%)</th>
        <th v-if="showPrice && !hidePoint" style="width: 150px">Price ($)</th>
      </tr>
    </thead>
    <tbody>
       <tr v-for="item in tableData" :key="item.id" class="active">
        <td style="width: 20px;">
          <div class="colour-sq" v-bind:style="{backgroundColor: getColour(item.id)}"></div>
        </td>
        <td style="text-align:left; width: 150px">
          <a v-if="showPrice" v-on:click="goToFT(item.id)">{{getLabel(item.id)}}</a>
          <span v-if="!showPrice">{{getLabel(item.id)}}</span>
        </td>

        <!-- range info -->
        <td v-if="hidePoint" class="instant-values">{{formatNumber(item.range.energy)}}</td>
        <!-- <td v-if="hidePoint">{{formatNumber(item.range.totalPower)}}</td> -->
        <td v-if="hidePoint">{{formatNumber(item.range.totalPower/rangeTotal*100, '0,0', '%')}}</td>
        <td v-if="showPrice && hidePoint">{{formatNumber(item.range.averagePrice, '0,0.00')}}</td>

        <!-- point info -->
        <td v-if="!hidePoint" class="instant-values">{{formatNumber(pointData[item.id])}}</td>
        <td v-if="!hidePoint">{{formatNumber(pointData[item.id]/pointTotal*100, '0,0', '%')}}</td>
        <td v-if="showPrice && !hidePoint"></td>
      </tr>
    </tbody>

    <tfoot>
      <tr>
        <td colspan="2"></td>

        <td v-if="hidePoint">{{formatNumber(energyTotal)}}</td>
        <!-- <td v-if="hidePoint">{{formatNumber(rangeTotal)}}</td> -->
        <td v-if="hidePoint"></td>
        <td v-if="showPrice && hidePoint"></td>

        <td v-if="!hidePoint">{{formatNumber(pointTotal)}}</td>
        <td v-if="!hidePoint"></td>
        <td v-if="showPrice && !hidePoint">${{formatNumber(pointData.rrp, '0,0.00')}}</td>
      </tr>
    </tfoot>

  </table>
</template>

<script>
import * as moment from 'moment'
import numeral from 'numeral'
import { mapGetters } from "vuex";


import { FUEL_TECH } from '../utils/FuelTechConfig'

export default {
  props: {
  	tableData: Array,
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
      rangeTotal: 0,
      energyTotal: 0,
      region: this.$route.params.region
    }
  },
  computed: {
    ...mapGetters({
      regionId: 'getRegionId'
    })
  },
  watch: {
    tableData: function(newData) {
      let rangeTotal = 0
      let energyTotal = 0
      newData.forEach(ft => {
        rangeTotal += ft.range.totalPower
        energyTotal += ft.range.energy
      })
      this.rangeTotal = rangeTotal
      this.energyTotal = energyTotal
    },
    pointData: function(newData) {
      let pointTotal = 0
      Object.keys(FUEL_TECH).forEach(ft => {
        if (newData[ft]) {
          pointTotal += newData[ft]
        }
      })
      this.pointTotal = pointTotal
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format('D MMM, h:mma')
    },
    formatNumber: function(number, precision, unit) {
      let formatter = precision ? precision : '0,0'
      unit = unit === undefined ? '' : unit
      let formatted = (number === 0 || isNaN(number)) ? '-' : numeral(number).format(formatter) + unit
      return formatted
    },
    getLabel(id) {
      const label = FUEL_TECH[id] ? FUEL_TECH[id].label : id
      return label
    },
    getColour(id) {
      const colour = FUEL_TECH[id] ? FUEL_TECH[id].colour : '#fff'
      return colour
    },
    goToFT(ft) {
      this.$router.push({
        name: 'generators',
        params: {
          region: this.regionId ,
          ft: ft
        }
      })
    }
  }
}

</script>

<style scoped>
table {
  font-size: 0.8rem;
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid #999;


  .value {
    padding-left: 10px;
    width: 200px;
    text-align: right;
  }

  td, th {
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

      .value  span {
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

.instant-values {
  border-left: 1px solid #999;
}
</style>
