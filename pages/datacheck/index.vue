<template>
  <section>
    <!-- <header>
      <div class="select">
        <select v-model="type">
          <option value="energy">energy</option>
          <option value="power">power</option>
        </select>
      </div>
      <div class="select">
        <select v-model="region">
          <option value="nem">nem</option>
          <option value="nsw1">nsw</option>
          <option value="qld1">qld</option>
          <option value="sa1">sa</option>
          <option value="tas1">tas</option>
          <option value="vic1">vic</option>
        </select>
      </div>
      <div
        v-if="type === 'energy'"
        class="select"
      >
        <select v-model="year">
          <option value="all">All</option>
          <option value="2019">2019</option>
          <option value="2018">2018</option>
          <option value="2017">2017</option>
          <option value="2016">2016</option>
          <option value="2015">2015</option>
        </select>
      </div>:
      <div class="url">
        <a 
          :href="url"
          target="_datasource"
        >{{ url }}</a>
      </div>
    </header>

    <div style="padding: 1rem;">
      <table class="table is-narrow is-bordered is-fullwidth is-hoverable">
        <thead>
          <tr>
            <th>Technology</th>
            <th class="has-text-right">Total {{ type }}</th>
            <th class="has-text-right">Market Value</th>
            <th class="has-text-right">Average Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th/>
            <th class="has-text-right">
              Gross: {{ grossTotal | formatValue }}<br>
              Net: {{ summaryTotal | formatValue }}
            </th>
            <th class="has-text-right">
              Sum (positive loads market value): {{ marketValueGrossTotal / 1000 | formatCurrency }}<br>
              Sum: {{ marketValueNetTotal / 1000 | formatCurrency }}
            </th>
            <th class="has-text-right">
              {{ marketValueGrossTotal / 1000 | formatCurrency }} / {{ summaryTotal | formatValue }}:
              {{ marketValueGrossTotal / summaryTotal / 1000 | formatCurrency }}<br>
              {{ marketValueNetTotal / 1000 | formatCurrency }} / {{ summaryTotal | formatValue }}:
              {{ marketValueNetTotal / summaryTotal / 1000 | formatCurrency }}
            </th>
          </tr>
          <tr
            v-for="(key, i) in keys"
            :key="i"
          >
            <td>{{ key.tech }}</td>
            <td class="has-text-right">{{ summary[key.id] | formatValue }}</td>
            <td class="has-text-right">{{ marketValues[key.marketValue] / 1000 | formatCurrency }}</td>
            <td class="has-text-right">
              {{ marketValues[key.marketValue] / summary[key.id] / 1000 | formatCurrency }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr>

    <div style="display: flex; position: relative;">
      <div style="width: 20%;">
        <DataList
          :nemData="data"
          :selected="selectedId"
          style="position: sticky; top: 0;"
          @selected="itemSelected"
        />
      </div>

      <div
        v-if="mounted && selectedItem"
        style="width: 80%; display: flex; position: relative;">

        <div style="width: 300px; margin-top: 1rem; margin-right: 1rem;">
          <div
            class="message is-dark"
            style="position: sticky; top: 10px;">
            <div class="message-body">
              <div>data history: <strong>{{ selectedItem.history.data.length }}</strong> points</div>
              <div>start: <strong>{{ selectedItem.history.start | formatDate }}</strong></div>
              <div>last: <strong>{{ selectedItem.history.last | formatDate }}</strong></div>
              <div>interval: <strong>{{ selectedItem.history.interval }}</strong></div>
              <div>unit: <strong>{{ selectedItem.units }}</strong></div>
            </div>
          </div>
        </div>

        <data-table-2
          :data="flattenData"
          :columns="columns"
          style="min-width: 400px;"
        />
      </div>
    </div>     -->
  </section>
</template>

<script>
// import moment from 'moment'
// import { timeMinute, timeDay } from 'd3-time'
// import includes from 'lodash.includes'
// import axios from 'axios'
// import EventBus from '~/plugins/eventBus.js'
// import * as FUEL_TECHS from '~/constants/fuelTech.js'
// import DataService from '~/services/DataService.js'
// import DataTransformService from '~/services/DataTransformService.js'
// import RegionPageMethods from '~/methods/regionPage.js'
// import DataList from '~/components/DataList.vue'
// import DataTable from '~/components/DataTable.vue'
// import DataTable2 from '~/components/DataTable2.vue'
// import LineVis from '~/components/Vis/Line.vue'

// export default {
//   components: {
//     DataList,
//     DataTable,
//     DataTable2,
//     LineVis
//   },

//   data() {
//     return {
//       mounted: false,
//       type: 'energy',
//       region: 'sa1',
//       year: '2018',
//       data: [],
//       flattenData: [],
//       columns: {},
//       url: '',
//       selectedId: '',
//       summary: {},
//       marketValues: {}
//     }
//   },

//   computed: {
//     nemLength() {
//       return this.data.length
//     },

//     availableKeys() {
//       return RegionPageMethods.computedAvailableKeys(
//         this.$store.getters.fuelTechOrder,
//         this.data
//       ).reverse()
//     },

//     keys() {
//       const type = this.type
//       const region = this.region
//       return this.availableKeys.map(ft => {
//         return {
//           tech: ft,
//           id: `${region}.fuel_tech.${ft}.${type}`,
//           marketValue: `${region}.fuel_tech.${ft}.market_value`
//         }
//       })
//     },

//     selectedItem() {
//       return this.data.find(d => d.id === this.selectedId)
//     },

//     summaryTotal() {
//       let total = 0
//       Object.keys(this.summary).forEach(key => {
//         total += this.summary[key]
//       })
//       return total
//     },

//     grossTotal() {
//       let total = 0
//       Object.keys(this.summary).forEach(key => {
//         const isLoad =
//           includes(key, 'pumps') ||
//           includes(key, 'battery_charging') ||
//           includes(key, 'exports')

//         if (!isLoad) {
//           total += this.summary[key]
//         }
//       })
//       return total
//     },

//     marketValueNetTotal() {
//       let total = 0
//       Object.keys(this.marketValues).forEach(key => {
//         total += this.marketValues[key]
//       })
//       return total
//     },

//     marketValueGrossTotal() {
//       let total = 0
//       Object.keys(this.marketValues).forEach(key => {
//         const isLoad =
//           includes(key, 'pumps') ||
//           includes(key, 'battery_charging') ||
//           includes(key, 'exports')

//         total += isLoad ? -this.marketValues[key] : this.marketValues[key]
//       })
//       return total
//     }
//   },

//   watch: {
//     selectedId(id) {
//       const find = this.data.find(d => d.id === id)
//       if (find) {
//         this.columns = DataTransformService.getColumns([find])
//         DataTransformService.flattenAndInterpolate([find], '5min').then(res => {
//           this.flattenData = res
//         })
//       }
//     },

//     type(selected) {
//       this.selectedId = ''
//       this.fetchData(selected, this.region, this.year)
//     },

//     region(selected) {
//       this.selectedId = ''
//       this.fetchData(this.type, selected, this.year)
//     },

//     year(selected) {
//       this.selectedId = ''
//       this.fetchData(this.type, this.region, selected)
//     }
//   },

//   mounted() {
//     this.mounted = true
//     this.fetchData(this.type, this.region, this.year)
//     // this.$store.commit('nem', this.data)
//     EventBus.$on('vis.mousemove', this.handleVisCursor)
//   },

//   beforeDestroy() {
//     EventBus.$off('vis.mousemove')
//   },

//   methods: {
//     fetchData(type, region, year) {
//       if (type === 'power') {
//         this.getPowerByRegion(region)
//       } else {
//         if (year === 'all') {
//           this.getEnergyByRegion(region)
//         } else {
//           this.getEnergyByRegionYear(region, year)
//         }
//       }
//     },
//     getEnergyByRegion(region) {
//       DataService.getEnergyByRegionAll(region).then(res =>
//         this.updateData(res.config.url, res.data)
//       )
//     },
//     getEnergyByRegionYear(region, year) {
//       DataService.getEnergyByRegionYear(region, year).then(res =>
//         this.updateData(res.config.url, res.data)
//       )
//     },
//     getPowerByRegion(region) {
//       DataService.getPowerByRegion(region).then(res =>
//         this.updateData(res.config.url, res.data)
//       )
//     },
//     updateData(url, data) {
//       this.data = data
//       this.url = url

//       const summary = {}
//       const marketValues = {}

//       DataTransformService.flattenAndInterpolate(
//         data,
//         this.keys,
//         '7D',
//         '5m'
//       ).then(res => {
//         console.log(res, this.keys)

//         this.keys.forEach(key => {
//           const sum = res.reduce(function(accumulator, currentValue) {
//             return currentValue[key.id]
//               ? accumulator + currentValue[key.id].value
//               : 0
//           }, 0)
//           const sumMarketValue = res.reduce(function(
//             accumulator,
//             currentValue
//           ) {
//             return currentValue[key.marketValue]
//               ? accumulator + currentValue[key.marketValue].value
//               : 0
//           },
//           0)
//           summary[key.id] = sum
//           marketValues[key.marketValue] = sumMarketValue
//         })

//         this.summary = summary
//         this.marketValues = marketValues
//       })
//     },
//     itemSelected(id) {
//       this.selectedId = id
//     },

//     handleVisCursor(date) {
//       const rounded = timeMinute.every(5).round(date)
//       console.log(rounded)
//     }
//   }
// }
</script>

<style lang="scss" scoped>
header {
  border-bottom: 1px solid #999;
  background-color: #fff;
  display: flex;
  padding: 10px;
  align-items: center;

  .select {
    margin-right: 0.5rem;
  }

  .url {
    margin-left: 10px;
    padding-top: 2px;
  }
}
table {
  font-family: 'Courier New', Courier, monospace;
}
</style>
