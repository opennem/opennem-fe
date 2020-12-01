<template>
  <div class="container-fluid">
    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div class="options">
        <!-- <label for="">Period</label> -->
        <!-- <strong>
          {{ selectedPeriodObject.label }}
        </strong> -->
        <!-- <div class="select is-rounded">
          <select v-model="selectedPeriod">
            <option
              v-for="(d, i) in periods"
              :key="`period-${i}`"
              :value="d.value"
            >
              {{ d.label }}
            </option>
          </select>
        </div> -->


        <!-- <label for=""><strong>Metric</strong></label> -->
        <div class="select is-rounded">
          <select v-model="selectedMetric">
            <option
              v-for="(d, i) in metrics"
              :key="`metric-${i}`"
              :value="d.value"
            >
              {{ d.label }}
            </option>
          </select>
        </div>
      </div>

      <ColourLegend
        v-if="statesData.length > 0"
        :svg-width="310"
        :svg-height="30"
        :unit="
          selectedMetricObject.value === 'carbonIntensity'
            ? ''
            : selectedMetricObject.unit
        "
        :multiplier="selectedMetricObject.divisor"
        :colour-range="selectedMetricObject.range"
        :colour-domain="selectedMetricObject.domain"
        :colour-domain-label="selectedMetricObject.domainLabel"
        :type="selectedMetricObject.legendType"
        class="colour-legend"
      />
    </div>

    <div class="vis-container">

      <section
        v-for="(d, i) in statesData"
        :key="`region-${i}`"
        :style="{ 'margin-top': d.yearlyData ? '0' : '15px'}"
        class="vis-section"
      >

        <!-- <div id="hover-line" /> -->

        <header
          :id="`region-${d.regionId}`">
          <h4 v-if="!d.yearlyData">
            {{ d.region }}
            <small>{{ getDateRange(d[selectedMetric]) }}</small>
          </h4>
        </header>

        <div
          v-if="hoverDate && d.regionId === hoverRegion"
          :style="{ top: d.yearlyData ? '-20px' : '5px'}"
          class="hover-date-value">
          <span class="date">{{ hoverDate }}</span>
          <span class="value">{{ hoverValueString }}</span>
        </div>

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
              :expected-data-length="366"
              :dataset="yData[selectedMetric]"
              :value-prop="selectedMetric"
              :tooltip-value-prop="selectedMetricObject.valueProp ? selectedMetricObject.valueProp : selectedMetric"
              :unit="selectedMetricObject.unit"
              :divisor="selectedMetricObject.divisor"
              :colour-range="selectedMetricObject.range"
              :colour-domain="selectedMetricObject.domain"
              :date-format-string="selectedPeriodObject.dateFormatString"
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
          <Heatmap
            :cell-height="75"
            :svg-width="width"
            :svg-height="75"
            :radius="0"
            :dataset="d[selectedMetric]"
            :value-prop="selectedMetric"
            :tooltip-value-prop="selectedMetricObject.valueProp ? selectedMetricObject.valueProp : selectedMetric"
            :unit="selectedMetricObject.unit"
            :divisor="selectedMetricObject.divisor"
            :colour-range="selectedMetricObject.range"
            :colour-domain="selectedMetricObject.domain"
            :date-format-string="selectedPeriodObject.dateFormatString"
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
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import { getEnergyRegions } from '@/constants/energy-regions.js'
import { periods, metrics, years } from '@/constants/metrics/'
import Heatmap from '@/components/Vis/_wip/Heatmap'
import ColourLegend from '@/components/Vis/ColourLegend'

export default {
  layout: 'main',

  components: {
    Heatmap,
    ColourLegend
  },

  head: {
    titleTemplate: 'OpenNEM Experiments: Metrics'
  },

  data() {
    return {
      width: 0,
      periods,
      metrics,
      years,
      statesData: [],
      regions: getEnergyRegions().filter(
        d => d.id !== 'all' && d.id !== 'nem' && d.id !== 'wem'
      ),
      hoverDate: null,
      hoverValueString: '',
      hoverRegion: ''
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName'
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
    }
  },

  watch: {
    regionId(id) {
      this.getData(id, this.selectedPeriod)
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
        console.log(this.width)
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
      doGetYearRegionData: 'regionEnergy/doGetYearRegionData'
    }),

    getData(id, period) {
      // reset
      this.yearlyData = []
      this.statesData = []

      const useAllPeriods = id === 'all' || id === 'nem'
      const filter =
        id === 'all'
          ? d => d.id !== 'all' && d.id !== 'nem'
          : id === 'nem'
            ? d => d.id !== 'all' && d.id !== 'nem' && d.id !== 'wem'
            : d => d.id === id
      const regions = getEnergyRegions().filter(filter)

      if (useAllPeriods) {
        this.selectedPeriod = 'all/month'
        this.getRegionsData(regions)
      } else {
        this.selectedPeriod = 'multiyear/day'
        regions.forEach((r, i) => {
          const yearlyData = []
          years.forEach((year, yIndex) => {
            setTimeout(() => {
              this.doGetYearRegionData({ region: r.id, year }).then(d => {
                const yearInt = parseInt(year)
                const last = new Date(yearInt, 11, 31)
                const start = new Date(yearInt, 0, 1)
                const propData = this.getProportionsDataset(
                  d.dataset,
                  d.domainPowerEnergy,
                  true
                )
                yearlyData.push({
                  year,
                  carbonIntensity: this.getEmissionIntensityDataset(
                    d.dataset,
                    d.domainPowerEnergy,
                    d.domainEmissions,
                    true
                  ),
                  renewablesProportion: propData,
                  gasProportion: propData,
                  coalProportion: propData,
                  importsExports: this.getImportsExportsDataset(
                    d.dataset,
                    d.domainPowerEnergy,
                    true
                  ),
                  temperature: this.getTemperatureDataset(
                    d.dataset,
                    d.domainTemperature,
                    true
                  )
                })
              })
            }, 200 * yIndex)
          })

          this.statesData.push({
            region: r.label,
            regionId: r.id,
            yearlyData
          })
        })
      }
    },

    getRegionsData(regions) {
      const arr = eachMonthOfInterval({
        start: new Date(2005, 3, 1),
        end: new Date()
      })
      console.log(arr)

      regions.forEach((r, i) => {
        setTimeout(() => {
          this.doGetRegionData({
            region: r.id,
            range: 'ALL',
            interval: 'Month',
            period: 'All',
            groupName: this.fuelTechGroupName
          }).then(d => {
            const propData = this.getProportionsDataset(
              d.currentDataset,
              d.currentDomainPowerEnergy,
              false
            )

            this.statesData.push({
              region: r.label,
              regionId: r.id,
              carbonIntensity: this.getEmissionIntensityDataset(
                d.currentDataset,
                d.currentDomainPowerEnergy,
                d.currentDomainEmissions,
                false
              ),
              renewablesProportion: propData,
              gasProportion: propData,
              coalProportion: propData,
              importsExports: this.getImportsExportsDataset(
                d.currentDataset,
                d.currentDomainPowerEnergy,
                false
              ),
              temperature: this.getTemperatureDataset(
                d.currentDataset,
                d.domainTemperature,
                false
              )
            })
          })
        }, 500 * i)
      })
    },

    getProportionsDataset(dataset, domains, topUp) {
      const data = dataset.map(d => {
        const obj = {
          date: d.date,
          time: d.time,
          // renewablesProportion:
          //   d._totalDemandRenewablesPercentage > 100
          //     ? 100
          //     : d._totalDemandRenewablesPercentage,
          renewablesProportion: d._totalDemandRenewablesPercentage,
          coalProportion:
            d._totalDemandCoalProportion < 0 ? 0 : d._totalDemandCoalProportion,
          coal: d._totalCoal,
          gasProportion:
            d._totalDemandGasProportion < 0 ? 0 : d._totalDemandGasProportion,
          gas: d._totalGas
        }
        return obj
      })

      if (topUp) {
        const lastDataDate = data[data.length - 1].date
        const last = new Date(lastDataDate.getFullYear(), 11, 31)
        const fillUp = differenceInDays(last, addDays(lastDataDate, 1))
        let cDate = lastDataDate
        for (let i = 1; i <= fillUp + 1; i++) {
          cDate = addDays(cDate, 1)
          data.push({
            date: cDate,
            time: cDate.getTime(),
            renewablesProportion: null,
            coalProportion: null,
            coal: null,
            gasProportion: null,
            gas: null
          })
        }
      }

      return data
    },

    getEmissionIntensityDataset(
      currentDataset,
      currentDomainPowerEnergy,
      currentDomainEmissions,
      topUp
    ) {
      const data = currentDataset.map(d => {
        const obj = {
          date: d.date,
          time: d.time,
          _isIncompleteBucket: d._isIncompleteBucket
        }
        let totalEmissions = 0,
          totalPowerEnergy = 0
        currentDomainEmissions.forEach(domain => {
          totalEmissions += d[domain.id] || 0
        })
        currentDomainPowerEnergy.forEach(domain => {
          if (domain.category !== 'load' || domain.fuelTech === 'exports') {
            totalPowerEnergy += d[domain.id] || 0
          }
        })
        obj._totalEmissions = totalEmissions
        obj._totalPowerEnergy = totalPowerEnergy

        let ei = totalEmissions / totalPowerEnergy
        const isValidEI = Number.isFinite(ei)

        obj.carbonIntensity = isValidEI ? ei : null

        return obj
      })

      if (topUp) {
        const lastDataDate = data[data.length - 1].date
        const last = new Date(lastDataDate.getFullYear(), 11, 31)
        const fillUp = differenceInDays(last, addDays(lastDataDate, 1))
        let cDate = lastDataDate
        for (let i = 1; i <= fillUp + 1; i++) {
          cDate = addDays(cDate, 1)
          data.push({
            date: cDate,
            time: cDate.getTime(),
            carbonIntensity: null
          })
        }
      }

      return data
    },

    getTemperatureDataset(dataset, domainTemperature, topUp) {
      const data = dataset.map(d => {
        const obj = {
          date: d.date,
          time: d.time
        }

        let temperature = null
        domainTemperature.forEach(domain => {
          if (domain.type === 'temperature_mean') {
            temperature = d[domain.id]
          }
        })

        obj.temperature = temperature
        return obj
      })

      if (topUp) {
        const lastDataDate = data[data.length - 1].date
        const last = new Date(lastDataDate.getFullYear(), 11, 31)
        const fillUp = differenceInDays(last, addDays(lastDataDate, 1))
        let cDate = lastDataDate
        for (let i = 1; i <= fillUp + 1; i++) {
          cDate = addDays(cDate, 1)
          data.push({
            date: cDate,
            time: cDate.getTime(),
            temperature: null
          })
        }
      }

      return data
    },

    getImportsExportsDataset(dataset, domainPowerEnergy, topUp) {
      const data = dataset.map(d => {
        const obj = {
          date: d.date,
          time: d.time
        }

        let sumImportsExports = 0,
          hasValue = false,
          importsExports = null

        domainPowerEnergy.forEach(domain => {
          if (domain.fuelTech === 'imports' || domain.fuelTech === 'exports') {
            if (d[domain.id] || d[domain.id] === 0) {
              hasValue = true
            }
            sumImportsExports += d[domain.id]
          }
        })

        // if no value
        importsExports = hasValue ? (sumImportsExports > 0 ? 1 : 0) : null
        if (!hasValue) {
          sumImportsExports = null
        }

        obj.importsExports = importsExports
        obj.sumImportsExports = sumImportsExports
        return obj
      })

      if (topUp) {
        const lastDataDate = data[data.length - 1].date
        const last = new Date(lastDataDate.getFullYear(), 11, 31)
        const fillUp = differenceInDays(last, addDays(lastDataDate, 1))
        let cDate = lastDataDate
        for (let i = 1; i <= fillUp + 1; i++) {
          cDate = addDays(cDate, 1)
          data.push({
            date: cDate,
            time: cDate.getTime(),
            importsExports: null,
            sumImportsExports: null
          })
        }
      }

      return data
    },

    handleMousemove({ id, date, valueString }, regionId) {
      this.hoverRegion = regionId
      this.hoverDate = date
      this.hoverValueString = valueString
    },
    handleMouseout() {
      this.hoverDate = null
      this.hoverValueString = ''
    },

    getDateRange(data) {
      const formatString = 'MMM yyyy'
      const firstDate = format(data[0].date, formatString)
      const lastDate = format(data[data.length - 1].date, formatString)
      return `${firstDate} — ${lastDate}`
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
}
.options {
  display: flex;
  align-items: center;

  & > * {
    margin: 0 1rem;
  }

  label {
    margin: 0 0.5rem 0 0;
  }
}

.vis-container {
  margin-top: 1.8rem;
}
.vis-section {
  position: relative;
  h4 {
    font-family: $header-font-family;
    font-size: 1.4em;
    font-weight: 700;
  }
  h5 {
    font-family: $header-font-family;
    font-weight: 700;
    font-size: 1em;
    position: absolute;
    z-index: 9;
    color: #fff;
    left: 5px;
    text-shadow: 0 1px 1px #000;
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
.colour-legend {
  // margin-top: 2rem;
}
.hover-date-value {
  font-size: 0.8em;
  display: flex;
  align-items: flex-end;
  position: absolute;
  right: 0;
  span {
    padding: 3px 12px 2px;
    white-space: nowrap;
  }
  .date {
    background-color: rgba(199, 69, 35, 0.1);
    color: #444;
    font-weight: 600;
    border-radius: 20px 0 0 20px;
  }
  .value {
    border-radius: 0 20px 20px 0;
    background-color: rgba(255, 255, 255, 0.5);
  }
}
#hover-line {
  background-color: red;
  width: 1px;
  height: 400px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
  opacity: 0;
}
</style>
