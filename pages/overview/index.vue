<template>
  <section class="overview">
    <h1>
      <app-logo class="logo" />
      <span>OpenNEM</span>
    </h1>

    <div class="filler-text">
      <p>
        <mark>
          Lorem ipsum dolor sit amet consectetur adipiscing elit, tempor diam cubilia dis
          sed gravida aliquam dictum, natoque quisque magna lacinia placerat cum. Luctus
          suspendisse massa erat orci volutpat sollicitudin proin, malesuada platea magnis
          pretium augue lobortis, condimentum vehicula quisque accumsan odio inceptos.
          Pharetra quam ut vel dictumst.
        </mark>
      </p>
    </div>

    <div class="overview-30-days">
      <h2>
        Total Energy for the Last 30 Days
      </h2>
      <group-selector class="group-selector" />
    </div>

    <section class="region-nem">
      <div class="region-donut">
        <nuxt-link :to="'/energy/nem'">NEM</nuxt-link>
        <donut-vis
          :donut-id="'nem'"
          :domains="nemDomains"
          :dataset="nemDataset"
          :dynamic-extent="dateFilter" />
      </div>
      <energy-legend
        :domains="nemDomains"
        :dataset="nemDataset"
        class="region-legend"
      />
    </section>

    <section class="region-donuts">
      <div class="region-donut">
        <nuxt-link :to="'/energy/nsw1'">New South Wales</nuxt-link>
        <donut-vis
          :donut-id="'nsw1'"
          :domains="nswDomains"
          :dataset="nswDataset"
          :dynamic-extent="dateFilter" />
      </div>

      <div class="region-donut">
        <nuxt-link :to="'/energy/qld1'">Queensland</nuxt-link>
        <donut-vis
          :donut-id="'qld1'"
          :domains="qldDomains"
          :dataset="qldDataset"
          :dynamic-extent="dateFilter" />
      </div>

      <div class="region-donut">
        <nuxt-link :to="'/energy/sa1'">South Australia</nuxt-link>
        <donut-vis
          :donut-id="'sa1'"
          :domains="saDomains"
          :dataset="saDataset"
          :dynamic-extent="dateFilter" />
      </div>

      <div class="region-donut">
        <nuxt-link :to="'/energy/tas1'">Tasmania</nuxt-link>
        <donut-vis
          :donut-id="'tas1'"
          :domains="tasDomains"
          :dataset="tasDataset"
          :dynamic-extent="dateFilter" />
      </div>

      <div class="region-donut">
        <nuxt-link :to="'/energy/vic1'">Victoria</nuxt-link>
        <donut-vis
          :donut-id="'vic1'"
          :domains="vicDomains"
          :dataset="vicDataset"
          :dynamic-extent="dateFilter" />
      </div>
    </section>
  </section>
</template>

<script>
import { max as d3Max } from 'd3-array'
import _includes from 'lodash.includes'
import { saveAs } from 'file-saver'

import Http from '~/services/Http.js'
import Data from '~/services/Data.js'
import EnergyDataTransform from '~/services/dataTransform/Energy.js'
import Domain from '~/services/Domain.js'
import domToImage from '~/services/DomToImage.js'

import AppLogo from '~/components/ui/Logo'
import GroupSelector from '~/components/ui/FuelTechGroupSelector'
import ExportHeader from '~/components/Energy/ExportHeader.vue'
import StackedAreaVis from '~/components/Vis/StackedArea.vue'
import LineVis from '~/components/Vis/Line.vue'
import SummaryTable from '~/components/SummaryTable'
import DonutVis from '~/components/Vis/SimpleDonut.vue'
import EnergyLegend from '~/components/Energy/Legend'

export default {
  layout: 'default',

  components: {
    AppLogo,
    GroupSelector,
    ExportHeader,
    StackedAreaVis,
    LineVis,
    SummaryTable,
    DonutVis,
    EnergyLegend
  },

  data() {
    return {
      ready: false,
      allResponses: [],
      dataset: [],
      nemDomains: [],
      nemDataset: [],
      nswDomains: [],
      nswDataset: [],
      qldDomains: [],
      qldDataset: [],
      saDomains: [],
      saDataset: [],
      tasDomains: [],
      tasDataset: [],
      vicDomains: [],
      vicDataset: [],
      energyDomains: [],
      fuelTechEnergyOrder: [],
      hiddenFuelTechs: [],
      emissionsOrder: [],
      marketValueDomains: [],
      temperatureDomains: [],
      temperatureMeanId: '',
      temperatureMinId: '',
      temperatureMaxId: '',
      priceDomains: [],
      emissionDomains: [],
      responses: [],
      filteredDataset: [],
      lineColour: '#e34a33',
      windowWidth: 0,
      stackedAreaHeight: 280
    }
  },

  computed: {
    type() {
      return this.$store.getters.energyChartType
    },
    regionId() {
      // return this.$route.params.region
      return 'nem'
    },
    range() {
      return this.$route.query.range || '30D'
    },
    interval() {
      return this.$route.query.interval || 'Day'
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
    groupMarketValueDomains() {
      const dict = this.fuelTechGroup
      const domains = this.marketValueDomains
      return Domain.parseDomains(domains, dict, 'market_value')
    },

    groupEmissionDomains() {
      const dict = this.fuelTechGroup
      const domains = this.emissionDomains
      return Domain.parseDomains(domains, dict, 'emissions')
    },

    hasTemperatureData() {
      return this.temperatureDomains.length > 0
    },
    hasPriceData() {
      return this.priceDomains.length > 0
    },
    hasEmissionData() {
      return this.emissionDomains.length > 0
    },
    energyCurveType() {
      return this.$store.getters.energyCurveType
    },
    step() {
      return this.$store.getters.step
    },
    mvDomains() {
      return this.groupMarketValueDomains.length > 0
        ? this.groupMarketValueDomains
        : this.marketValueDomains
    },
    stackedAreaDomains() {
      const hidden = this.hiddenFuelTechs
      let domains =
        this.groupDomains.length > 0 ? this.groupDomains : this.energyDomains
      return this.fuelTechGroup
        ? domains.filter(d => !_includes(hidden, d.id))
        : domains.filter(d => !_includes(hidden, d.fuelTech))
    },
    donutDomains() {
      const hidden = this.hiddenFuelTechs
      let domains =
        this.groupDomains.length > 0 ? this.groupDomains : this.energyDomains
      domains = this.fuelTechGroup
        ? domains.filter(d => !_includes(hidden, d.id))
        : domains.filter(d => !_includes(hidden, d.fuelTech))
      return domains.filter(d => d.category === 'source')
    },
    summaryDomains() {
      return this.groupDomains.length > 0
        ? this.groupDomains
        : this.energyDomains
    },
    emissionStackedAreaDomains() {
      return this.groupEmissionDomains.length > 0
        ? this.groupEmissionDomains
        : this.emissionDomains
    },
    emissionsMax() {
      return d3Max(this.dataset, d => d._totalEmissionsVol)
    }
  },

  watch: {
    groupDomains(domains) {
      if (domains) {
        this.updateDatasetGroups(this.dataset, domains)
      }
    },
    groupMarketValueDomains(domains) {
      if (domains) {
        this.updateDatasetGroups(this.dataset, domains)
      }
    },
    groupEmissionDomains(domains) {
      if (domains) {
        this.updateDatasetGroups(this.dataset, domains)
      }
    },
    fuelTechGroup() {
      this.parseAllResponses(this.allResponses)
    }
  },

  mounted() {
    const promises = [
      this.fetchData('nem', this.range),
      this.fetchData('nsw1', this.range),
      this.fetchData('qld1', this.range),
      this.fetchData('sa1', this.range),
      this.fetchData('tas1', this.range),
      this.fetchData('vic1', this.range)
    ]

    Promise.all(promises).then(allResponses => {
      this.allResponses = allResponses
      this.parseAllResponses(allResponses)
    })
  },

  methods: {
    fetchData(region, range) {
      const promise = new Promise(resolve => {
        const urls = Data.getEnergyUrls(region, range)

        if (urls.length > 0) {
          Http(urls)
            .then(responses => {
              resolve(this.handleResponses(responses))
            })
            .catch(e => {
              console.error(e)
            })
        } else {
          console.warn('fetchData', 'No urls provided')
        }
      })

      return promise
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
      return responses
      // EnergyDataTransform.mergeResponses(
      //   responses,
      //   this.energyDomains,
      //   this.marketValueDomains,
      //   this.temperatureDomains,
      //   this.priceDomains,
      //   this.emissionDomains,
      //   this.range,
      //   this.interval
      // ).then(dataset => {
      //   this.dataset = dataset
      //   // this.dateFilter = d3Extent(this.dataset, d => d.date)
      //   if (this.groupDomains.length > 0) {
      //     this.updateDatasetGroups(dataset, this.groupDomains)
      //   }
      //   if (this.groupMarketValueDomains.length > 0) {
      //     this.updateDatasetGroups(dataset, this.groupMarketValueDomains)
      //   }
      //   if (this.groupEmissionDomains.length > 0) {
      //     this.updateDatasetGroups(dataset, this.groupEmissionDomains)
      //   }
      //   this.updatedFilteredDataset(dataset)
      //   this.ready = true
      // })
    },

    parseAllResponses(allResponses) {
      this.resetDatasets()

      allResponses.forEach(response => {
        const regionId = response[0].data[0].region
        const energyDomains = this.getEnergyDomains(regionId, response)
        const hasGroup = this.fuelTechGroup ? true : false
        const dict = this.fuelTechGroup
        const r = response[0]

        if (regionId === 'nem') {
          this.nemDomains = this.getRegionDomains(energyDomains, dict, hasGroup)
          this.updateRegionDatasets(regionId, this.nemDomains, r, hasGroup)
        }
        if (regionId === 'nsw1') {
          this.nswDomains = this.getRegionDomains(energyDomains, dict, hasGroup)
          this.updateRegionDatasets(regionId, this.nswDomains, r, hasGroup)
        }
        if (regionId === 'qld1') {
          this.qldDomains = this.getRegionDomains(energyDomains, dict, hasGroup)
          this.updateRegionDatasets(regionId, this.qldDomains, r, hasGroup)
        }
        if (regionId === 'sa1') {
          this.saDomains = this.getRegionDomains(energyDomains, dict, hasGroup)
          this.updateRegionDatasets(regionId, this.saDomains, r, hasGroup)
        }
        if (regionId === 'tas1') {
          this.tasDomains = this.getRegionDomains(energyDomains, dict, hasGroup)
          this.updateRegionDatasets(regionId, this.tasDomains, r, hasGroup)
        }
        if (regionId === 'vic1') {
          this.vicDomains = this.getRegionDomains(energyDomains, dict, hasGroup)
          this.updateRegionDatasets(regionId, this.vicDomains, r, hasGroup)
        }
      })
    },

    getRegionDomains(energyDomains, dict, hasGroup) {
      return hasGroup
        ? Domain.parseDomains(energyDomains, dict, 'energy')
        : energyDomains
    },

    resetDatasets() {
      this.nemDataset = []
      this.nswDataset = []
      this.qldDataset = []
      this.saDataset = []
      this.tasDataset = []
      this.vicDataset = []
    },

    updateRegionDatasets(regionId, domains, dataset, hasGroup) {
      domains.forEach(domain => {
        if (domain.category === 'source') {
          const data = dataset.data
          let find = null
          let id = null
          let total = 0

          if (hasGroup) {
            if (domain.domainIds) {
              id = domain.id
              domain.domainIds.forEach(domainId => {
                find = data.find(d => d.id === domainId)
                total += find.history.data.reduce((a, b) => a + b, 0)
              })
              if (_includes(id, 'imports.energy')) {
                total = -total
              }
            }
          } else {
            find = data.find(d => d.id === domain.id)
            id = find.id
            total = find.history.data.reduce((a, b) => a + b, 0)
            if (domain.label === 'Imports') {
              total = -total
            }
          }
          const obj = {}
          obj[id] = total
          if (regionId === 'nem') {
            this.nemDataset.push(obj)
          }
          if (regionId === 'nsw1') {
            this.nswDataset.push(obj)
          }
          if (regionId === 'qld1') {
            this.qldDataset.push(obj)
          }
          if (regionId === 'sa1') {
            this.saDataset.push(obj)
          }
          if (regionId === 'tas1') {
            this.tasDataset.push(obj)
          }
          if (regionId === 'vic1') {
            this.vicDataset.push(obj)
          }
        }
      })
    },

    getEnergyDomains(regionId, res) {
      const energyDomains = Domain.getEnergyDomains(res)
      const fuelTechEnergyOrder = Domain.getDomainObjsOrder(
        energyDomains,
        this.fuelTechOrder
      )
      return Domain.getDomainObjs(
        regionId,
        fuelTechEnergyOrder,
        energyDomains[0].type
      )
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
      this.updateEmissionDomains(res)
      this.updateMarketValueDomains(res)
      this.updateTemperatureDomains(res)
      this.updatePriceDomains(res)
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

    updateMarketValueDomains(res) {
      this.marketValueDomains = Domain.getDomainObjs(
        this.regionId,
        this.fuelTechEnergyOrder,
        'market_value'
      )
    },

    updateEmissionDomains(res) {
      const emissionDomains = Domain.getEmissionsDomains(res)
      this.emissionsOrder = Domain.getDomainObjsOrder(
        emissionDomains,
        this.fuelTechOrder
      )
      this.emissionDomains = Domain.getDomainObjs(
        this.regionId,
        this.emissionsOrder,
        'emissions'
      )
    },

    updateTemperatureDomains(res) {
      const temperatureDomainsAndIds = Domain.getTemperatureDomainsAndIds(res)

      this.temperatureDomains = temperatureDomainsAndIds.domains
      this.temperatureMeanId = temperatureDomainsAndIds.meanId
      this.temperatureMinId = temperatureDomainsAndIds.minId
      this.temperatureMaxId = temperatureDomainsAndIds.maxId
    },

    updatePriceDomains(res) {
      this.priceDomains = Domain.getPriceDomains(res)
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.overview {
  text-align: center;
  padding: 1rem;
}
.filler-text p {
  font-size: 16px;
  margin-bottom: 1rem;
  mark {
    color: #ddd;
    background-color: #ddd;
  }
}

.overview-30-days {
  margin: 3rem 0 2rem;

  .group-selector {
    font-size: 1em;
  }
}

h1 {
  font-size: 28px;
  font-weight: 600;
  font-family: $header-font-family;
  .logo {
    width: 60px;
    margin: 0 auto;
  }
  span {
    position: relative;
    top: -8px;
  }
}

h2 {
  font-size: 20px;
  font-weight: 600;
  font-family: $header-font-family;
}

.region-donuts {
  display: flex;
  flex-wrap: wrap;

  .region-donut {
    width: 33%;
  }
}
.region-donut {
  a {
    font-family: $header-font-family;
    font-weight: 600;
    font-size: 16px;
  }
}
.region-nem {
  border-bottom: 1px solid #ddd;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .region-legend {
    width: 40%;
    padding: 1rem;

    ::v-deep .legend-item {
      width: 50%;
    }
  }
}
</style>
