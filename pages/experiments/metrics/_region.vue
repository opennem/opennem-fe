<template>
  <div class="container-fluid">
    <h3 v-if="useAllPeriods">{{ getDateRange(allBucket) }}</h3>

    <OptionsLegend
      :legend-width="tabletBreak ? 200 : 310"
      :show-legend="regionData.length > 0"
      :hover-display="hoverDisplay"
      :use-hover="!useAllPeriods"
      :show-hover="hoverDate ? true : false"
    />

    <div class="vis-container">
      <section
        v-for="(d, i) in regionData"
        :key="`region-${i}`"
        :style="{ 'margin-top': useAllPeriods ? '35px' : '0' }"
        class="vis-section"
      >

        <HoverMetric
          v-if="hoverDate"
          :is-yearly="d.yearlyData && d.yearlyData.length > 0 ? true : false"
          :hover-date="hoverDate"
          :data="d[selectedMetric]"
          :hover-value="hoverValue"
          :selected-metric="selectedMetric"
          :selected-metric-object="selectedMetricObject"
          :selected-period="selectedPeriodObject"
          :style="{ display: useAllPeriods ? 'block' : 'none' }"
          @hover-obj="d => hoverDisplay = d"
        />

        <div v-if="d.yearlyData">
          <section
            v-for="(yData, yIndex) in d.yearlyData"
            :key="`yearly-${i}-${yIndex}`"
            style="width: 100%"
          >
            <h5>{{ yData.year }}</h5>
            <Heatmap
              :cell-height="50"
              :svg-width="width"
              :svg-height="50"
              :radius="0"
              :dataset="yData[selectedMetric]"
              :value-prop="selectedMetric"
              :tooltip-value-prop="selectedMetricObject.valueProp ? selectedMetricObject.valueProp : selectedMetric"
              :divisor="selectedMetricObject.divisor"
              :offset="selectedMetricObject.offset"
              :colour-range="selectedMetricObject.range"
              :colour-domain="selectedMetricObject.domain"
              @rect-mousemove="obj => {
                handleMousemove(obj, d.regionId)
              }"
              @rect-mouseout="handleMouseout"
            />
          </section>
        </div>
        <div
          v-else
          style="width: 100%">
          <h5 :class="{ dark: shouldDarken(d[selectedMetric], selectedMetric) }">{{ d.region }}</h5>
          <Heatmap
            :cell-height="75"
            :svg-width="width"
            :svg-height="75"
            :radius="0"
            :dataset="d[selectedMetric]"
            :value-prop="selectedMetric"
            :tooltip-value-prop="selectedMetricObject.valueProp ? selectedMetricObject.valueProp : selectedMetric"
            :divisor="selectedMetricObject.divisor"
            :offset="selectedMetricObject.offset"
            :colour-range="selectedMetricObject.range"
            :colour-domain="selectedMetricObject.domain"
            :hover-date="hoverDate"
            @rect-mousemove="obj => {
              handleMousemove(obj, d.regionId)
            }"
            @rect-mouseout="handleMouseout"
          />
        </div>
      </section>
    </div>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { extent } from 'd3-array'
import { select, mouse } from 'd3-selection'
import debounce from 'lodash.debounce'
import addDays from 'date-fns/addDays'
import format from 'date-fns/format'
import differenceInDays from 'date-fns/differenceInDays'
import { getEnergyRegions } from '@/constants/energy-regions.js'
import {
  periods,
  metrics,
  yearsBucket,
  allRangeBucket,
  yearDailyRangeBucket
} from '@/constants/metrics/'
import Heatmap from '@/components/Vis/_wip/Heatmap'
import ColourLegend from '@/components/Vis/ColourLegend'

import VisSection from '@/components/Metrics/VisSection'
import OptionsLegend from '@/components/Metrics/OptionsLegend'
import HoverMetric from '@/components/Metrics/HoverMetric'

export default {
  layout: 'main',

  components: {
    Heatmap,
    ColourLegend,
    VisSection,
    OptionsLegend,
    HoverMetric
  },

  head: {
    titleTemplate: 'OpenNEM Experiments: Metrics'
  },

  data() {
    return {
      width: 0,
      periods,
      metrics,
      yearsBucket,
      allBucket: allRangeBucket(),
      regionData: [],
      regions: getEnergyRegions().filter(
        d => d.id !== 'au' && d.id !== 'nem' && d.id !== 'wem'
      ),
      hoverDate: null,
      hoverValue: null,
      hoverRegion: '',
      hoverDisplay: null
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName',
      tabletBreak: 'app/tabletBreak',
      v3Paths: 'feature/v3Paths'
    }),

    selectedPeriod: {
      get() {
        return this.$store.getters['metrics/selectedPeriod']
      },

      set(val) {
        this.$store.commit('metrics/selectedPeriod', val)
      }
    },

    selectedMetric: {
      get() {
        return this.$store.getters['metrics/selectedMetric']
      },

      set(val) {
        this.$router.push({
          query: {
            metric: val
          }
        })
        this.$store.commit('metrics/selectedMetric', val)
      }
    },

    selectedMetricObject() {
      return this.metrics.find(m => m.value === this.selectedMetric)
    },

    selectedPeriodObject() {
      return this.periods.find(p => p.value === this.selectedPeriod)
    },

    regionId() {
      return this.$route.params.region
    },

    queryMetric() {
      return this.$route.query.metric
    },

    useAllPeriods() {
      return this.regionId === 'au' || this.regionId === 'nem'
    }
  },

  watch: {
    regionId(id) {
      this.getData(id, this.selectedPeriod)
    }
  },

  created() {
    if (this.queryMetric) {
      this.selectedMetric = this.queryMetric
    } else {
      this.$router.push({
        query: {
          metric: this.selectedMetric
        }
      })
    }
  },

  mounted() {
    this.$store.dispatch('currentView', 'experiments/metrics')
    this.getData(this.regionId, this.selectedPeriod)

    this.width = this.$el.offsetWidth - 32

    window.addEventListener(
      'resize',
      debounce(() => {
        this.width =
          this.$el.offsetWidth === 0 ? this.width : this.$el.offsetWidth - 32
      }),
      50
    )

    //     const $vis = select('.vis-container')
    //     let mouseinside = false
    //
    //     $vis
    //       .on('mousemove touchmove', function() {
    //         const m = mouse(this)
    //         const $hoverLine = select('#hover-line')
    //         $hoverLine.style('left', `${m[0] - 1}px`)
    //         if (!mouseinside) {
    //           $hoverLine.style('opacity', 1)
    //           mouseinside = true
    //         }
    //       })
    //       .on('mouseout', () => {
    //         const $hoverLine = select('#hover-line')
    //         $hoverLine.style('opacity', 0)
    //         mouseinside = false
    //       })
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'regionEnergy/doGetRegionData',
      doGetRegionDataByRangeInterval:
        'regionEnergy/doGetRegionDataByRangeInterval',
      doGetYearRegionData: 'regionEnergy/doGetYearRegionData'
    }),

    getData(id, period) {
      // reset
      this.regionData = []

      const filter =
        id === 'au'
          ? d => d.id !== 'au' && d.id !== 'nem'
          : id === 'nem'
            ? d => d.id !== 'au' && d.id !== 'nem' && d.id !== 'wem'
            : d => d.id === id
      const regions = getEnergyRegions().filter(filter)

      if (this.useAllPeriods) {
        this.selectedPeriod = 'all/month'
        this.getRegionsData(regions)
      } else {
        this.selectedPeriod = 'multiyear/day'
        regions.forEach((r, i) => {
          const yearlyData = []

          if (this.v3Paths) {
            this.doGetRegionData({ region: r.id }).then(d => {
              yearsBucket.forEach((year, yIndex) => {
                const yearInt = parseInt(year)
                const dataset = d.dataset.filter(
                  e => e.date.getFullYear() === yearInt
                )

                if (dataset.length > 0) {
                  const propData = this.generateDataset(
                    dataset,
                    d.domainPowerEnergy,
                    d.domainEmissions,
                    d.domainTemperature,
                    d.domainPrice,
                    true,
                    yearDailyRangeBucket(yearInt)
                  )
                  yearlyData.push({
                    year,
                    carbonIntensity: propData,
                    renewablesProportion: propData,
                    windProportion: propData,
                    solarProportion: propData,
                    gasProportion: propData,
                    coalProportion: propData,
                    importsExports: propData,
                    temperature: propData,
                    maxTemperature: propData,
                    netInterconnectorFlow: propData,
                    price: propData
                  })
                }
              })
            })
          } else {
            yearsBucket.forEach((year, yIndex) => {
              setTimeout(() => {
                this.doGetYearRegionData({ region: r.id, year }).then(d => {
                  const yearInt = parseInt(year)
                  const last = new Date(yearInt, 11, 31)
                  const start = new Date(yearInt, 0, 1)
                  const propData = this.generateDataset(
                    d.dataset,
                    d.domainPowerEnergy,
                    d.domainEmissions,
                    d.domainTemperature,
                    d.domainPrice,
                    true
                  )
                  yearlyData.push({
                    year,
                    carbonIntensity: propData,
                    renewablesProportion: propData,
                    windProportion: propData,
                    solarProportion: propData,
                    gasProportion: propData,
                    coalProportion: propData,
                    importsExports: propData,
                    temperature: propData,
                    maxTemperature: propData,
                    netInterconnectorFlow: propData,
                    price: propData
                  })
                })
              }, 500 * yIndex)
            })
          }

          this.regionData.push({
            region: r.label,
            regionId: r.id,
            yearlyData
          })
        })
      }
    },

    getRegionsData(regions) {
      regions.forEach((r, i) => {
        setTimeout(() => {
          this.doGetRegionDataByRangeInterval({
            region: r.id,
            range: 'ALL',
            interval: 'Month',
            period: 'All',
            groupName: this.fuelTechGroupName
          }).then(d => {
            const propData = this.generateDataset(
              d.currentDataset,
              d.currentDomainPowerEnergy,
              d.currentDomainEmissions,
              d.domainTemperature,
              d.domainPrice,
              false,
              this.allBucket
            )

            this.regionData.push({
              region: r.label,
              regionId: r.id,
              carbonIntensity: propData,
              renewablesProportion: propData,
              windProportion: propData,
              solarProportion: propData,
              gasProportion: propData,
              coalProportion: propData,
              importsExports: propData,
              temperature: propData,
              maxTemperature: propData,
              netInterconnectorFlow: propData,
              price: propData
            })
          })
        }, 500 * i)
      })
    },

    generateDataset(
      dataset,
      domainPowerEnergy,
      domainEmissions,
      domainTemperature,
      domainPrice,
      topUp,
      bucket
    ) {
      if (bucket) {
        const data = bucket.map(d => {
          const obj = this.createEmptyObj(d.date, d.time)
          const find = dataset.find(x => x.time === d.time)
          return this.calculateMetricData(
            obj,
            find,
            domainPowerEnergy,
            domainEmissions,
            domainTemperature,
            domainPrice
          )
        })

        return data
      }

      const data = dataset.map(d => {
        const obj = this.createEmptyObj(d.date, d.time)
        return this.calculateMetricData(
          obj,
          d,
          domainPowerEnergy,
          domainEmissions,
          domainTemperature,
          domainPrice
        )
      })

      if (data.length > 0 && topUp) {
        const lastDataDate = data[data.length - 1].date
        const last = new Date(lastDataDate.getFullYear(), 11, 31)
        const fillUp = differenceInDays(last, addDays(lastDataDate, 1))
        let cDate = lastDataDate
        for (let i = 1; i <= fillUp + 1; i++) {
          cDate = addDays(cDate, 1)
          data.push(this.createEmptyObj(cDate, cDate.getTime()))
        }
      }

      return data
    },

    handleMousemove({ id, date, value }, regionId) {
      this.hoverRegion = regionId
      this.hoverDate = date
      this.hoverValue = value
    },
    handleMouseout() {
      this.hoverDate = null
      this.hoverValue = null
    },

    getDateRange(data) {
      const formatString = 'MMM yyyy'
      const firstDate = format(data[0].date, formatString)
      const lastDate = format(data[data.length - 1].date, formatString)
      return `${firstDate} – ${lastDate}`
    },

    createEmptyObj(date, time) {
      return {
        date,
        time,
        carbonIntensity: null,
        renewablesProportion: null,
        windProportion: null,
        solarProportion: null,
        coalProportion: null,
        coal: null,
        gasProportion: null,
        gas: null,
        temperature: null,
        maxTemperature: null,
        importsExports: null,
        sumImportsExports: null,
        netInterconnectorFlow: null,
        price: null
      }
    },

    calculateMetricData(
      obj,
      d,
      domainPowerEnergy,
      domainEmissions,
      domainTemperature,
      domainPrice
    ) {
      if (d) {
        let totalEmissions = 0,
          totalPowerEnergy = 0,
          temperature = null,
          maxTemperature = null,
          sumImportsExports = 0,
          hasImportsExportsValue = false,
          importsExports = null,
          hasEmissionsValue = false

        domainEmissions.forEach(domain => {
          if (d[domain.id] || d[domain.id] === 0) {
            hasEmissionsValue = true
          }
          totalEmissions += d[domain.id] || 0
        })
        domainPowerEnergy.forEach(domain => {
          if (domain.category !== 'load' || domain.fuelTech === 'exports') {
            totalPowerEnergy += d[domain.id] || 0
          }
          if (domain.fuelTech === 'imports' || domain.fuelTech === 'exports') {
            if (d[domain.id] || d[domain.id] === 0) {
              hasImportsExportsValue = true
            }
            sumImportsExports += d[domain.id]
          }
        })
        domainTemperature.forEach(domain => {
          if (domain.type === 'temperature_mean') {
            temperature = d[domain.id]
          }
          if (domain.type === 'temperature_max') {
            maxTemperature = d[domain.id]
          }
        })

        const ei = hasEmissionsValue ? totalEmissions / totalPowerEnergy : null
        const isValidEI = Number.isFinite(ei)

        // if no value
        importsExports = hasImportsExportsValue
          ? sumImportsExports > 0
            ? 1
            : 0
          : null
        if (!hasImportsExportsValue) {
          sumImportsExports = null
        }

        obj.carbonIntensity = isValidEI ? ei : null
        obj.renewablesProportion =
          d._totalDemandRenewablesPercentage < 0
            ? 0
            : d._totalDemandRenewablesPercentage
        obj.windProportion =
          d._totalDemandWindProportion < 0 ? 0 : d._totalDemandWindProportion
        obj.solarProportion =
          d._totalDemandSolarProportion < 0 ? 0 : d._totalDemandSolarProportion
        obj.coalProportion =
          d._totalDemandCoalProportion < 0 ? 0 : d._totalDemandCoalProportion
        obj.coal = d._totalCoal
        obj.gasProportion =
          d._totalDemandGasProportion < 0 ? 0 : d._totalDemandGasProportion
        obj.gas = d._totalGas
        obj.temperature = temperature
        obj.maxTemperature = maxTemperature
        obj.importsExports = importsExports
        obj.sumImportsExports = sumImportsExports
        obj.netInterconnectorFlow = d._totalDemandImportsExportsProportion
        obj.price = d._volWeightedPrice
      }

      return obj
    },

    shouldDarken(data, prop) {
      const check = data.filter((d, i) => i < 20).map(d => d[prop])
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.container-fluid {
  padding: 1rem 16px;
  height: 100%;

  @include mobile {
    padding-top: 0;
  }
}

h3 {
  font-family: $header-font-family;
  font-size: 1.4em;
  font-weight: 300;
  margin-left: 2px;
  padding-bottom: 0.5rem;
  text-align: right;
  border-bottom: 1px solid #ddd;
}

.vis-container {
  margin-top: 1.8rem;
}
.vis-section {
  position: relative;

  h4 {
    font-family: $header-font-family;
    font-size: 1.2em;
    font-weight: 700;
  }
  h5 {
    font-family: $header-font-family;
    font-weight: 700;
    font-size: 1em;
    position: absolute;
    z-index: 9;
    color: #fff;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
    background-color: rgba(0, 0, 0, 0.2);
    padding: 0 3px 1px;
    border-radius: 0 0 1px 0;
    left: 1px;
    margin-top: 1px;
  }
  header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;

    small {
      font-family: $family-primary;
      font-size: 0.7em;
      font-weight: 300;
    }
  }
}

::v-deep .heatmap {
  border: 1px solid #ddd;
}
</style>
