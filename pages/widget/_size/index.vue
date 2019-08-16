<template>
  <section>
    <div
      v-if="ready"
      class="chart">
      <div class="chart-title">
        <div>
          <strong>Generation</strong>
          <small>MW</small>
        </div>
        <div
          v-if="hoverOn"
          class="hover-date-value">
          <div class="hover-date">
            <time>
              {{ hoverDisplayDate }}
            </time>
          </div>
          <div class="hover-values">
            <span
              v-if="hoverValue"
              class="ft-value">
              <em
                :style="{ 'background-color': hoverDomainColour }"
                class="colour-square" />
              {{ hoverDomainLabel }}
              <strong>{{ hoverValue | formatValue }} GWh</strong>
            </span>
            <span class="total-value">
              Total
              <strong>{{ hoverTotal | formatValue }} GWh</strong>
            </span>
          </div>
        </div>
      </div>
      <stacked-area-vis
        :domains="stackedAreaDomains"
        :dataset="dataset"
        :dynamic-extent="dateFilter"
        :hover-date="hoverDate"
        :hover-on="hoverOn"
        :range="range"
        :interval="interval"
        :curve="energyCurveType"
        :mouse-loc="mouseLoc"
        :vis-height="stackedAreaHeight"
        :zoomed="zoomed"
        :x-guides="xGuides"
        @eventChange="handleEventChange"
        @dateOver="handleDateOver"
        @domainOver="handleDomainOver"
      />
    </div>
    
    <summary-table
      v-if="ready && summary"
      :domains="summaryDomains"
      :dataset="filteredDataset"
      :range="range"
      :interval="interval"
      :hover-date="hoverDate"
      :hover-on="hoverOn"
      :is-energy="false"
      :domain-toggleable="false"
      :group-selection="true"
      class="export-summary"
    />

    <energy-legend
      v-if="ready && legend"
      :domains="summaryDomains"
      :dataset="filteredDataset"
      class="widget-legend"
    />

    <div class="widget-footer">
      <div>
        <a
          href="https://opennem.org.au/"
          target="opennem_related">OpenNEM</a> is a project of the
        <a
          href="https://www.energy-transition-hub.org/"
          target="opennem_related">Energy Transition Hub</a>
      </div>

      <div>
        <a
          v-if="!summary"
          class="icon-link"
          @click="handleLegendToggle">
          <i class="fal fa-fw fa-list-alt" />
        </a>
        <a
          class="icon-link"
          href="https://opennem.org.au/"
          target="opennem_related">
          <i class="fal fa-fw fa-info-circle" />
        </a>
      </div>
    </div>
  </section>
</template>

<script>
import _includes from 'lodash.includes'
import { mouse as d3Mouse } from 'd3-selection'

import REGIONS from '~/constants/regions.js'
import EventBus from '~/plugins/eventBus.js'
import Http from '~/services/Http.js'
import DateDisplay from '~/services/DateDisplay.js'
import Data from '~/services/Data.js'
import EnergyDataTransform from '~/services/dataTransform/Energy.js'
import Domain from '~/services/Domain.js'

import StackedAreaVis from '~/components/Vis/StackedArea.vue'
import SummaryTable from '~/components/SummaryTable'
import EnergyLegend from '~/components/Energy/Legend'

export default {
  layout: 'widget',

  components: {
    StackedAreaVis,
    SummaryTable,
    EnergyLegend
  },

  data() {
    return {
      ready: false,
      regionId: 'nem',
      dataset: [],
      energyDomains: [],
      fuelTechEnergyOrder: [],
      hiddenFuelTechs: [],
      responses: [],
      filteredDataset: [],
      lineColour: '#e34a33',
      windowWidth: 0,
      stackedAreaHeight: 280,
      legend: false,
      mouseLoc: null,
      hoverDate: null,
      hoverDomain: null,
      hoverOn: false
    }
  },

  computed: {
    size() {
      return this.$route.params.size || 'small'
    },
    summary() {
      return this.size === 'large'
    },
    type() {
      return this.$store.getters.energyChartType
    },
    range() {
      return this.$route.query.range || '7D'
    },
    interval() {
      return this.$route.query.interval || '30m'
    },
    zoomed() {
      return this.$store.getters.dateFilter.length !== 0
    },
    dateFilter() {
      const start = this.$route.query.start
      const end = this.$route.query.end
      if (start && end) {
        return [start, end]
      }
      return []
    },
    fuelTechOrder() {
      return this.$store.getters.fuelTechOrder
    },
    fuelTechGroup() {
      return this.$store.getters.fuelTechGroup
    },
    groupDomains() {
      const dict = this.fuelTechGroup
      const domains = this.energyDomains
      return Domain.parseDomains(domains, dict, 'energy')
    },
    energyCurveType() {
      return this.$store.getters.energyCurveType
    },
    stackedAreaDomains() {
      const hidden = this.hiddenFuelTechs
      let domains =
        this.groupDomains.length > 0 ? this.groupDomains : this.energyDomains
      return this.fuelTechGroup
        ? domains.filter(d => !_includes(hidden, d.id))
        : domains.filter(d => !_includes(hidden, d.fuelTech))
    },
    summaryDomains() {
      return this.groupDomains.length > 0
        ? this.groupDomains
        : this.energyDomains
    },
    xGuides() {
      let dStart = this.dataset[0].date
      const dEnd = this.dataset[this.dataset.length - 1].date

      if (this.interval === 'Day') {
        return DateDisplay.weekendGuides(dStart, dEnd, this.interval)
      }
      if (this.interval === '5m' || this.interval === '30m') {
        return DateDisplay.nightGuides(dStart, dEnd)
      }
      return []
    },
    hoverDisplayDate() {
      return DateDisplay.specialDateFormats(
        new Date(this.hoverDate).getTime(),
        this.range,
        this.interval,
        false,
        false,
        false,
        true
      )
    },
    hoverData() {
      const time = new Date(this.hoverDate).getTime()
      return this.dataset.find(d => d.date === time)
    },
    hoverDomainLabel() {
      const find = this.summaryDomains.find(d => d.id === this.hoverDomain)
      return find ? find.label : '—'
    },
    hoverValue() {
      return this.hoverData ? this.hoverData[this.hoverDomain] : null
    },
    hoverDomainColour() {
      const find = this.stackedAreaDomains.find(d => d.id === this.hoverDomain)
      if (find) return find.colour
      return null
    },
    hoverTotal() {
      let total = 0
      if (this.hoverData) {
        this.stackedAreaDomains.forEach(d => {
          total += this.hoverData[d.id]
        })
      }
      return total
    }
  },

  watch: {
    groupDomains(domains) {
      if (domains) {
        this.updateDatasetGroups(this.dataset, domains)
      }
    }
  },

  mounted() {
    EventBus.$on('dataset.filter', this.handleDatasetFilter)
    EventBus.$on('vis.mousemove', this.handleVisMouseMove)
    EventBus.$on('vis.mouseenter', this.handleVisEnter)
    EventBus.$on('vis.mouseleave', this.handleVisLeave)
    this.fetchData(this.regionId, this.range)
  },

  beforeDestroy() {
    EventBus.$off('dataset.filter')
    EventBus.$off('vis.mousemove')
    EventBus.$off('vis.mouseenter')
    EventBus.$off('vis.mouseleave')
  },

  methods: {
    fetchData(region, range) {
      const urls = Data.getEnergyUrls(region, range)

      if (urls.length > 0) {
        Http(urls)
          .then(responses => {
            this.handleResponses(responses)
          })
          .catch(e => {
            console.error(e)
          })
      } else {
        console.warn('fetchData', 'No urls provided')
      }
    },

    handleResponses(responses) {
      // !!! Removing Vol weighted Price after requesting ALL data
      // - due to incorrect data
      if (this.range === 'ALL') {
        responses.forEach(r => {
          const findIndex = r.data.findIndex(
            d => d.type === 'volume_weighted_price'
          )
          if (findIndex) {
            r.data.splice(findIndex, 1)
          }
        })
      }

      this.responses = responses
      this.updateDomains(responses)
      EnergyDataTransform.mergeResponses(
        responses,
        this.energyDomains,
        [],
        [],
        [],
        [],
        this.range,
        this.interval
      ).then(dataset => {
        this.dataset = dataset
        // this.dateFilter = d3Extent(this.dataset, d => d.date)
        if (this.groupDomains.length > 0) {
          this.updateDatasetGroups(dataset, this.groupDomains)
        }
        this.updatedFilteredDataset(dataset)
        this.ready = true
      })
    },

    updateDatasetGroups(dataset, groupDomains) {
      this.dataset = dataset.map(d => {
        // create new group domains (if not already there)
        groupDomains.forEach(g => {
          let groupValue = 0
          g.domainIds.forEach(dId => {
            groupValue += d[dId]
          })
          d[g.id] = groupValue
        })
        return d
      })
    },

    updateDomains(res) {
      // Find out about available domains first before flattening data
      this.updateEnergyDomains(res)
    },

    updateEnergyDomains(res) {
      const energyDomains = Domain.getEnergyDomains(res)
      this.fuelTechEnergyOrder = Domain.getDomainObjsOrder(
        energyDomains,
        this.fuelTechOrder
      )
      this.energyDomains = Domain.getDomainObjs(
        this.regionId,
        this.fuelTechEnergyOrder,
        this.type
      )
    },

    updatedFilteredDataset(dataset) {
      // This is to filter the dataset based on the chart zoom
      // - used by Summary table
      if (this.dateFilter.length > 0) {
        this.filteredDataset = EnergyDataTransform.filterDataByStartEndDates(
          dataset,
          this.dateFilter[0],
          this.dateFilter[1]
        )
      } else {
        this.filteredDataset = dataset
      }
    },

    handleDatasetFilter(dateRange) {
      if (dateRange && dateRange.length > 0) {
        const startTime = DateDisplay.snapToClosestInterval(
          this.interval,
          dateRange[0]
        )
        // const endTime = DateDisplay.snapToClosestInterval(this.interval, dateRange[1])
        const endTime = dateRange[1]
        this.filteredDataset = EnergyDataTransform.filterDataByStartEndDates(
          this.dataset,
          startTime,
          endTime
        )
        this.setDateFilter([startTime, endTime])
      } else {
        this.setDateFilter([])
        this.filteredDataset = this.dataset
      }
    },

    setDateFilter(dates) {
      // this.dateFilter = dates
      this.$store.dispatch('dateFilter', dates)
    },

    handleEventChange(evt) {
      this.mouseLoc = d3Mouse(evt)
    },

    handleDateOver(evt, date) {
      const closestDate = DateDisplay.snapToClosestInterval(this.interval, date)
      EventBus.$emit('vis.mousemove', evt, this.dataset, closestDate)
    },

    handleDomainOver(domain) {
      this.hoverDomain = domain
    },

    handleVisMouseMove(evt, dataset, date) {
      this.hoverDate = date
    },

    handleVisEnter() {
      this.hoverOn = true
    },

    handleVisLeave() {
      this.hoverOn = false
    },

    handleLegendToggle() {
      this.legend = !this.legend
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.chart {
  position: relative;

  .chart-title {
    font-size: 0.8em;
    padding: 0.3rem 1rem;
    user-select: none;
    display: flex;
    justify-content: space-between;

    > div {
      height: 1.1rem;
    }

    .hover-date-value {
      display: flex;
      font-size: 0.9em;
    }

    .hover-date,
    .hover-values {
      background: rgba(255, 255, 255, 0.5);
      padding: 3px 10px 2px;
      white-space: nowrap;
    }

    .hover-date {
      font-weight: 600;
      background-color: rgba(199, 69, 35, 0.1);
      color: #444;
      border-radius: 4px 0 0 4px;
      font-size: 0.9em;
      padding-top: 2px;
    }

    .hover-values {
      border-radius: 0 4px 4px 0;
      display: flex;
      align-items: center;
      font-size: 0.8em;
      .ft-value {
        margin-right: 1rem;
      }
      .mean-temp-value {
        margin: 0 1rem;
      }
      strong {
        font-size: 1.3em;
      }
    }

    .colour-square {
      display: inline-block;
      border: 1px solid transparent;
      width: 9px;
      height: 9px;
      border-radius: 1px;
      position: relative;
      top: 1px;
    }
  }
}

.widget-legend {
  position: absolute;
  z-index: 99;
  right: 0;
  bottom: 30px;
  background-color: #fff;
  font-size: 9px;
}
::v-deep .legend {
  display: block;
}
::v-deep .legend .legend-item {
  width: 100%;
  border-bottom: 1px solid #ddd;
}
::v-deep .colour-square {
  width: 10px;
  height: 10px;
  margin-right: 3px;
}

.widget-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 8px;
  border-top: 1px solid #ddd;

  a {
    border-bottom: 1px dashed $opennem-link-color;

    &.icon-link {
      border-bottom: none;
      font-size: 16px;
    }
  }
}
</style>
