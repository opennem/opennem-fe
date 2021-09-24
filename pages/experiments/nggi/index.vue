<template>
  <div class="container">
    <h1>NGGI Emissions</h1>

    <div class="chart-table">
      <EmissionsChart
        v-if="dataset.length > 0"
        :emissions-dataset="dataset"
        :domain-emissions="domains"
        :range="range"
        :interval="interval"
        :show-x-axis="true"
        :average-emissions="averageEmissions"
        :vis-height="450"
        :hover-on="isHovering"
        :hover-date="hoverDate"
        :zoom-extent="zoomExtent"
        class="chart"
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
        @zoomExtent="handleZoomExtent"
      />

      <div class="table">
        <table class="summary-list">
          <tbody>
            <tr
              v-for="(d, i) in domainEmissions"
              :key="i">
              <td>
                <div
                  :style="{ backgroundColor: d.colour}"
                  class="colour-square" />
                <span>{{ d.label }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import parse from 'date-fns/parse'
import subMonths from 'date-fns/subMonths'
import Papa from 'papaparse'

import regionDisplayTzs from '@/constants/region-display-timezones.js'
import DateDisplay from '@/services/DateDisplay.js'
import { mutateDate } from '@/services/datetime-helpers.js'
import EmissionsChart from '@/components/Charts/EmissionsChart'

const domainEmissions = [
  {
    label: 'Agriculture',
    id: 'agriculture',
    domain: 'agriculture',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#003f5c'
  },
  {
    label: 'Electricity',
    id: 'electricity',
    domain: 'electricity',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#2f4b7c'
  },
  {
    label: 'Fugitives',
    id: 'fugitives',
    domain: 'fugitives',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#665191'
  },
  {
    label: 'Industrial',
    id: 'industrial',
    domain: 'industrial',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#a05195'
  },
  {
    label: 'Land sector',
    id: 'land-sector',
    domain: 'land-sector',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#d45087'
  },
  {
    label: 'Stationary',
    id: 'stationary',
    domain: 'stationary',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#f95d6a'
  },
  {
    label: 'Transport',
    id: 'transport',
    domain: 'transport',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#ff7c43'
  },
  {
    label: 'Waste',
    id: 'waste',
    domain: 'waste',
    type: 'emissions',
    units: 'MtCO2e',
    colour: '#ffa600'
  }
]

export default {
  layout: 'no-container',

  components: {
    EmissionsChart
  },

  data() {
    return {
      dataset: [],
      zoomExtent: [],
      isHovering: false,
      hoverDate: null
    }
  },

  computed: {
    averageEmissions() {
      const totalEmissions = this.dataset.reduce(
        (prev, cur) => prev + cur._totalEmissions,
        0
      )

      console.log(totalEmissions)

      return totalEmissions / this.dataset.length
    }
  },

  created() {
    this.domains = domainEmissions.map(d => d)
    this.domainEmissions = domainEmissions.map(d => d).reverse()
    this.range = 'All'
    this.interval = 'Quarter'
    this.displayTz = regionDisplayTzs['au']
  },

  mounted() {
    const url =
      'https://gist.githubusercontent.com/chienleng/0bb3b5ab285c781a342c7776fc52fc27/raw/956e2201926c2f8da56ce4d24c65f1be0e72055f/nggi.csv'
    this.$axios.get(url).then(res => {
      const csvData = Papa.parse(res.data, { header: true })
      const data = csvData.data.map(d => {
        const obj = {}
        let totalEmissions = 0
        const date = subMonths(parse(d.Quarter, 'MMM-yyyy', new Date()), 2)

        obj.date = date
        obj.time = obj.date.getTime()
        obj.quarter = d.Quarter

        this.domainEmissions.forEach(domain => {
          obj[domain.id] = parseFloat(d[domain.label])
          totalEmissions += obj[domain.id] || 0
        })

        obj._totalEmissions = totalEmissions
        return obj
      })

      this.doUpdateXGuides({
        interval: this.interval,
        start: data[0].time,
        end: data[data.length - 1].time
      })

      this.doUpdateXTicks({
        range: this.range,
        interval: this.interval,
        isZoomed: false,
        filterPeriod: false
      })

      this.dataset = data
    })
  },

  methods: {
    ...mapActions({
      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateXTicks: 'visInteract/doUpdateXTicks',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats'
    }),

    handleDateHover(date) {
      this.hoverDate = DateDisplay.getClosestDateByInterval(
        date,
        this.interval,
        'All'
      )
    },

    handleIsHovering(hovering) {
      this.isHovering = hovering
    },

    handleZoomExtent(dateRange) {
      let filteredDates = []
      if (dateRange && dateRange.length > 0) {
        let startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        let endTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[1]
        )
        // if (this.interval === 'Fin Year') {
        //   startTime = addYears(startTime, 2)
        //   endTime = addYears(endTime, 1)
        // }

        filteredDates = [startTime, endTime]
      } else {
        filteredDates = []
      }

      this.zoomExtent = filteredDates
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.container {
  max-width: 80%;
}
h1 {
  font-family: Playfair Display, Georgia, Times New Roman, Times, serif;
  font-weight: 700;
  font-size: 36px;
  margin: 2rem 0;
}
.colour-square {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 5px;
  border-radius: 4px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);

  @include mobile {
    display: inline;
    float: none;
  }
}
.chart-table {
  display: flex;
  gap: 2rem;

  .chart {
    width: 70%;
  }
  .table {
    width: 30%;
  }
}
</style>
