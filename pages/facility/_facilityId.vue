<template>
  <section class="facility">
    <div v-if="facility">
      <header>
        <h2>{{ facilityName }}</h2>
      </header>
      <SummaryPlaceholder />

      <h3>Facility units</h3>
      <PowerChart 
        :hover-on="isHovering"
        :hover-date="hoverDate"
        :dataset="powerDataset"
        :domains="unitsSummary"
        :display-unit="powerUnit"
        :zoom-extent="zoomExtent"
        :facility-id="facilityId"
        class="facility-chart"
        @dateHover="handleDateHover"
        @isHovering="handleIsHovering"
        @zoomExtent="handleZoomExtent"
      />

      <section class="facility-units card">
        <table class="summary-list">
          <thead>
            <tr>
              <th/>
              <th>Code</th>
              <th>Status</th>
              <th>Registered capacity</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(d, i) in unitsSummary"
              :key="i"
              @mouseenter="handleMouseEnter(d.code)"
              @mouseleave="handleMouseLeave">
              <td>
                <div 
                  :style="{ backgroundColor: d.colour}" 
                  class="colour-square" />
              </td>
              <td>
                {{ d.code }}
              </td>
              <td>{{ d.status }}</td>
              <td>{{ d.registeredCapacity }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <InfoPlaceholder />

      <FacilityProperties :facility="facility" />
    </div>
    
    <aside v-if="facility">
      <section>
        <figure>
          <img
            src="~/assets/img/placeholder-facility.png"
            alt="Facility image placeholder">
          <figcaption>{{ facilityName }} facility</figcaption>
        </figure>
      </section>
      
      <section class="map">
        <MiniMap 
          :lat="facilityLocation.lat" 
          :lng="facilityLocation.lng" />
        <small>Lat: {{ facilityLocation.lat }} Lng: {{ facilityLocation.lng }}</small>
      </section>
      
      <MetaInfo 
        :facility-id="facilityId"
        :facility-state="facilityState"
        :units-num="facilityUnits.length"
        :participant-name="participant"
      />
    </aside>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import _uniq from 'lodash.uniq'
import _sortBy from 'lodash.sortby'
import { interpolateRgb, quantize } from 'd3-interpolate'
import { color } from 'd3-color'

import DateDisplay from '@/services/DateDisplay.js'
import PowerChart from '@/components/Facility/Charts/PowerChart.vue'
import MiniMap from '@/components/Facility/MiniMap.vue'
import MetaInfo from '@/components/Facility/MetaInfo.vue'
import FacilityProperties from '@/components/Facility/Properties.vue'
import SummaryPlaceholder from '@/components/Facility/SummaryPlaceholder.vue'
import InfoPlaceholder from '@/components/Facility/InfoPlaceholder.vue'
import * as FT from '~/constants/fuel-tech.js'

export default {
  components: {
    PowerChart,
    MiniMap,
    MetaInfo,
    FacilityProperties,
    SummaryPlaceholder,
    InfoPlaceholder
  },

  data() {
    return {
      zoomExtent: [],
      isHovering: false,
      hoverDate: null
    }
  },

  computed: {
    ...mapGetters({
      facility: 'facility/selectedFacility',
      powerDataset: 'facility/selectedFacilityUnitsDataset'
    }),
    powerUnit() {
      return 'MW'
    },
    facilityId() {
      return this.$route.params.facilityId
    },
    facilityName() {
      return this.facility ? this.facility.name : ''
    },
    facilityUnits() {
      return this.facility
        ? _sortBy(this.facility.facilities, ['status.code', 'code'])
        : []
    },
    facilityLocation() {
      return this.facility ? this.facility.location : { lat: 0, lng: 0 }
    },
    facilityState() {
      return this.facility && this.facility.location
        ? this.facility.location.state
        : ''
    },
    facilityFuelTechsColours() {
      const fuelTechs = this.facilityUnits.map(d => {
        return d.fueltech ? d.fueltech.code : ''
      })

      // get only unique fuel techs
      const uniqFuelTechs = _uniq(fuelTechs.filter(d => d !== '')).sort()
      const uniqFuelTechsCount = {}
      uniqFuelTechs.forEach(d => {
        uniqFuelTechsCount[d] = fuelTechs.filter(ft => ft === d).length
      })

      // set different opacity variations of fuel tech
      const colours = {}
      uniqFuelTechs.forEach(ft => {
        const colour = color(this.getUnitColour(ft))
        const count = uniqFuelTechsCount[ft]

        colours[ft] =
          count > 1
            ? quantize(
                interpolateRgb(
                  colour,
                  colour.copy({ opacity: 1 / count + 0.3 })
                ),
                count
              ).reverse()
            : [colour.formatRgb()]
      })

      // apply each colour variation to facility unit
      const obj = {}
      uniqFuelTechs.forEach(ft => {
        const filter = this.facilityUnits.filter(
          d => d.fueltech && d.fueltech.code === ft
        )
        filter.forEach((f, i) => {
          obj[f.code] = colours[ft][i]
        })
      })

      return obj
    },
    participant() {
      return this.facility ? this.facility.participant_id : ''
    },
    unitsSummary() {
      return this.facilityUnits.map((d, i) => {
        return {
          colour: this.facilityFuelTechsColours[d.code],
          domain: d.code,
          id: d.code,
          code: d.code,
          registeredCapacity: d.capacity_registered,
          status: d.status ? d.status.label : ''
        }
      })
    }
  },

  watch: {
    facilityUnits(units) {
      // this.doProcessData(units)
    },
    facility(update) {
      const facilities = update.facilities
      const networkRegion = update.network ? update.network.code : ''
      const facilityId = update.code
      this.doGetStationStats({ networkRegion, facilityId })
    }
  },

  created() {
    this.doGetFacilityById({
      facilityId: this.facilityId
    })
  },

  methods: {
    ...mapMutations({
      setHighlightDomain: 'visInteract/highlightDomain'
    }),
    ...mapActions({
      doGetFacilityById: 'facility/doGetFacilityById',
      doGetStationStats: 'facility/doGetStationStats',
      doProcessData: 'facility/doProcessData'
    }),
    getUnitColour(fuelTech) {
      const unknownColour = '#ccc'
      if (fuelTech) {
        const colour = FT.DEFAULT_FUEL_TECH_COLOUR[fuelTech]
        return colour || unknownColour
      }
      return unknownColour
    },
    handleZoomExtent(dateRange) {
      this.zoomExtent = dateRange
    },
    handleMouseEnter(code) {
      this.setHighlightDomain(code)
    },
    handleMouseLeave() {
      this.setHighlightDomain('')
    },
    handleDateHover(date) {
      const closestDate = DateDisplay.snapToClosestInterval('5m', date)
      this.hoverDate = closestDate
    },
    handleIsHovering(hovering) {
      this.isHovering = hovering
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

$radius: 0.5rem;

.colour-square {
  width: 18px;
  height: 18px;
}

.facility {
  display: flex;
  margin: 1rem;

  & > div {
    width: 70%;
    padding: 1rem;
  }
}

header {
  h2 {
    font-family: $header-font-family;
    font-size: 1.6em;
    font-weight: 700;
  }
}

::v-deep h3 {
  font-family: $header-font-family;
  font-size: 1.4em;
  border-bottom: 1px solid #666;
}

.facility-chart {
  width: 100%;
  margin-top: 1rem;
}

.facility-units {
  margin: 0.5rem 0;
}

.facility-meta {
  margin: 0.5rem 0;
}

aside {
  width: 30%;
  margin-top: 1rem;

  figure {
    margin-bottom: 1rem;
  }

  img {
    border-radius: $radius;
  }

  figcaption {
    text-align: center;
    font-size: 0.8em;
    font-weight: 700;
  }
}

::v-deep .card {
  background-color: #fff;
  border-radius: $radius;
  padding: 1rem;
  font-size: 0.9em;

  & > .card {
    font-size: 1em;
  }

  &.dark {
    background-color: #333;
    color: #fff;

    table th,
    table td {
      color: #fff;
      border-bottom-color: #666;
    }

    header h4 {
      border-bottom-color: #666;
    }
  }

  &.dim {
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;

    table th,
    table td {
      color: #fff;
      border-bottom-color: #666;
    }

    header h4 {
      border-bottom-color: #666;
    }
  }

  header {
    h4 {
      font-family: $header-font-family;
      font-size: 1.5em;
      font-weight: 700;
      border-bottom: 1px solid #ddd;
    }
  }

  table {
    width: 100%;
  }
  td,
  th {
    border-bottom: 1px solid #efefef;
    padding: 3px 6px;
  }
}
</style>
