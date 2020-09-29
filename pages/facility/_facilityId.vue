<template>
  <section class="facility">
    <transition name="fade">
      <div 
        v-if="!fetchingFacility && !facility"
        class="not-found-card card"
        style="height: 60vh; margin: 0 auto;">
        <i class="fal fa-industry-alt"/>
        <span>Facility not available</span>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="facility">
        <header>
          <h2>{{ facilityName }}</h2>
        </header>
      
        <Summary
          v-if="hasDescriptionOrWikiLink"
          :description="facilityDescription" 
          :wiki-link="facilityWikiLink" />

        <section class="facility-chart">
          <transition name="fade">
            <div 
              v-if="!fetchingStats && powerDataset.length === 0" 
              class="not-found-card card">
              <i class="fal fa-chart-area"/>
              <span>Power and energy data not available</span>
            </div>
          </transition>

          <transition name="fade">
            <PowerChart 
              v-if="!fetchingStats && powerDataset.length > 0"
              :hover-on="isHovering"
              :hover-date="hoverDate"
              :dataset="powerDataset"
              :domains="unitsSummary"
              :display-unit="powerUnit"
              :zoom-extent="zoomExtent"
              :facility-id="facilityId"
              :y-max="facilityRegisteredCapacity"
              @dateHover="handleDateHover"
              @isHovering="handleIsHovering"
              @zoomExtent="handleZoomExtent"
            />
          </transition>
        </section>

        <section class="facility-units card">
          <UnitList 
            :units="unitsSummary"
            :hover-on="isHovering"
            :hover-date="hoverDate"
            :dataset="powerDataset"
            @codeHover="handleCodeHover" />
        </section>

        <!-- <InfoPlaceholder /> -->

        <FacilityProperties 
          :facility="facility" 
          class="facility-props" />
      </div>
    </transition>
    
    <transition name="fade">
      <aside v-if="facility">
        <section>
          <transition name="fade">
            <Photos 
              v-if="facilityPhotos.length > 0" 
              :photos="facilityPhotos" 
              :name="facilityName" />
          </transition>

          <transition name="fade">
            <div 
              v-if="facilityPhotos.length === 0" 
              class="not-found-card card">
              <i class="fal fa-image"/>
              <span>Image not available</span>
            </div>
          </transition>
        </section>
      
        <section>
          <transition name="fade">
            <MiniMap
              v-if="hasFacilityLocation"
              :lat="facilityLocation.lat"
              :lng="facilityLocation.lng"
              class="map" />
          </transition>

          <transition name="fade">
            <div 
              v-if="!hasFacilityLocation" 
              class="not-found-card card">
              <i class="fal fa-map-marker-alt"/>
              <span>Location not available</span>
            </div>
          </transition>
        </section>
      
        <MetaInfo 
          :facility-id="facilityId"
          :facility-state="facilityState"
          :units-num="facilityUnits.length"
          :participant-name="participant"
          class="aside-section"
        />
      </aside>
    </transition>
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
import UnitList from '@/components/Facility/UnitList.vue'
import Photos from '@/components/Facility/Photos.vue'
import MiniMap from '@/components/Facility/MiniMap.vue'
import MetaInfo from '@/components/Facility/MetaInfo.vue'
import FacilityProperties from '@/components/Facility/Properties.vue'
import Summary from '@/components/Facility/Summary.vue'
import InfoPlaceholder from '@/components/Facility/InfoPlaceholder.vue'
import * as FT from '~/constants/fuel-tech.js'

export default {
  layout: 'facility',
  components: {
    PowerChart,
    UnitList,
    Photos,
    MiniMap,
    MetaInfo,
    FacilityProperties,
    Summary,
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
      fetchingFacility: 'facility/fetchingFacility',
      fetchingStats: 'facility/fetchingStats',
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
      return this.facility && this.facility.name ? this.facility.name : ''
    },
    facilityDescription() {
      return this.facility && this.facility.description
        ? this.facility.description
        : ''
    },
    facilityWikiLink() {
      return this.facility && this.facility.wikipedia_link
        ? this.facility.wikipedia_link
        : ''
    },
    hasDescriptionOrWikiLink() {
      return this.facilityDescription !== '' || this.facilityWikiLink !== ''
    },
    facilityUnits() {
      return this.facility
        ? _sortBy(this.facility.facilities, ['status.code', 'code'])
        : []
    },
    facilityRegisteredCapacity() {
      return this.operatingDomains.length > 0
        ? this.operatingDomains.reduce(
            (acc, cur) => acc + (cur.registeredCapacity || 0),
            0
          )
        : 0
    },
    facilityLocation() {
      return this.facility ? this.facility.location : null
    },
    hasFacilityLocation() {
      return (
        this.facilityLocation &&
        this.facilityLocation.lat &&
        this.facilityLocation.lng
      )
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
    facilityPhotos() {
      return this.facility ? this.facility.photos : []
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
    },
    operatingDomains() {
      return this.unitsSummary.filter(d => d.status === 'Operating')
    }
  },

  watch: {
    facilityUnits(units) {
      // this.doProcessData(units)
    },
    facility(update) {
      if (update) {
        const facilities = update.facilities
        const networkRegion = update.network ? update.network.code : ''
        const facilityId = update.code
        this.doGetStationStats({ networkRegion, facilityId })
      }
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
    handleCodeHover(code) {
      this.setHighlightDomain(code)
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

.facility {
  display: flex;
  margin: 1rem;

  & > div {
    width: 70%;
    padding: 1rem;
  }
}

header {
  margin-bottom: 1rem;
  padding: 0 1.5rem;

  h2 {
    font-family: $header-font-family;
    font-size: 1.8em;
    font-weight: 700;
  }
}

::v-deep h3 {
  font-family: $header-font-family;
  font-size: 1.4em;
  border-bottom: 1px solid #666;
}

.facility-chart {
  $chartHeight: 231px;
  width: 100%;
  min-height: $chartHeight;
  margin-bottom: 1rem;
  padding: 0 12px 0 11px;

  .not-found-card {
    height: $chartHeight;
  }
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

  section,
  .aside-section {
    margin-bottom: 1rem;
  }

  figcaption {
    text-align: center;
    font-size: 0.8em;
    font-weight: 700;
  }
}

.not-found-card {
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  box-shadow: none;
  color: #888;
  background: rgba(0, 0, 0, 0.1);
  i {
    font-size: 1.3em;
    width: 100%;
    text-align: center;
  }
  span {
    font-size: 0.9em;
  }
}

::v-deep .card {
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
  }

  &.dim {
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;

    table th,
    table td {
      color: #fff;
      border-bottom-color: #666;
    }
  }

  header {
    h4 {
      font-family: $header-font-family;
      font-size: 1.5em;
      font-weight: 700;
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

.facility-props {
  margin-top: 3rem;
}
</style>
