<template>
  <div>
    <facility-filters
      :selected-techs="selectedTechs"
      :selected-statuses="selectedStatuses"
      :selected-sizes="selectedSizes"
      class="facility-filters"
      @techsSelect="handleTechsSelected"
      @selectedStatuses="handleStatusesSelected"
      @selectedSizes="handleSizesSelected"
      @facilityNameFilter="handleFacilityNameFilter"
    />

    <transition name="fade">
      <div 
        v-if="!ready" 
        class="facility-list-map-container loading-containers">
        <div class="facility-list">
          <div 
            class="loader-block" 
            style="height: 400px" />
        </div>
        <div 
          class="facility-map" 
          style="margin-top: 127px">
          <div 
            class="loader-block" 
            style="height: 400px" />
        </div>
      </div>
    </transition>

    <div 
      v-if="ready" 
      class="facility-list-map-container">
      <facility-list
        v-if="!tabletBreak || (tabletBreak && selectedView === 'list')"
        :filtered-facilities="filteredFacilities"
        :selected-facility="selectedFacility"
        :selected-techs="selectedTechs"
        :selected-statuses="selectedStatuses"
        :sort-by="sortBy"
        :order-by="orderBy"
        :hide-region-column="!isNemRegion && !isAllRegion"
        class="facility-list"
        @orderChanged="handleOrderChange"
        @facilitySelect="handleFacilitySelect"
        @facilityHover="handleFacilityHover"
        @facilityMouseout="handleFacilityOut"
        @openFacilityView="handleOpenFacilityView"
      />

      <FacilityMap
        v-if="!tabletBreak || (tabletBreak && selectedView === 'map')"
        :data="filteredFacilities"
        :hovered="hoveredFacility"
        :selected="selectedFacility"
        class="facility-map"
        @facilitySelect="handleMapFacilitySelect"
        @facilityOpen="handleMapFacilityOpen"
      />

      <transition name="slide-up-fade">
        <facility-card
          v-if="selectedFacility"
          :selected-techs="selectedTechs"
          :facility="selectedFacility"
          @close="handleCloseDetail"
        />
      </transition>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import _debounce from 'lodash.debounce'
import _includes from 'lodash.includes'
import _orderBy from 'lodash.orderby'
import _cloneDeep from 'lodash.clonedeep'

import * as FUEL_TECHS from '~/constants/energy-fuel-techs/group-default.js'
import {
  FACILITY_OPERATING,
  isValidFacilityStatus
} from '~/constants/facility-status.js'
import {
  FACILITY_SIZE,
  isValidFacilitySize
} from '~/constants/facility-size.js'

import {
  FacilityRegions,
  getNEMRegionArray,
  getFacilityRegionLabel
} from '~/constants/facility-regions.js'

import Http from '~/services/Http.js'
import FacilityDataParse from '@/data/parse/facility'
import FacilityFilters from '~/components/Facility/Filters.vue'
import FacilityList from '~/components/Facility/List.vue'
import FacilityMap from '~/components/Facility/Map.vue'
import FacilityCard from '~/components/Facility/Card.vue'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

export default {
  layout: 'main',

  head() {
    return {
      title: ` Facilities: ${getFacilityRegionLabel(this.regionId)}`,
      meta: [
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: `OpenNEM Facilities: ${getFacilityRegionLabel(
            this.regionId
          )}`
        },
        {
          hid: 'twitter:image:src',
          name: 'twitter:image:src',
          content: this.cardFilename
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `OpenNEM Facilities: ${getFacilityRegionLabel(
            this.regionId
          )}`
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: this.cardFilename
        },
        {
          hid: 'og:image:width',
          property: 'og:image:width',
          content: '1447'
        },
        {
          hid: 'og:image:height',
          property: 'og:image:height',
          content: '932'
        }
      ]
    }
  },

  components: {
    FacilityFilters,
    FacilityList,
    FacilityMap,
    FacilityCard
  },

  data() {
    return {
      ready: false,
      filterString: '',
      facilityData: [],
      selectedFacility: null,
      hoveredFacility: null,
      selectedStatuses: [],
      selectedTechs: [],
      selectedSizes: [],
      sortBy: 'displayName',
      orderBy: ASCENDING,
      totalFacilities: 0,
      shouldZoomWhenSelected: false,
      baseUrl: `${this.$config.url}/images/screens/`,
      useDev: this.$config.useDev
    }
  },

  computed: {
    ...mapGetters({
      hostEnv: 'hostEnv',
      windowWidth: 'app/windowWidth',
      tabletBreak: 'app/tabletBreak'
    }),
    filteredFacilities: {
      get() {
        return this.$store.getters['facility/filteredFacilities']
      },
      set(facilities) {
        this.setFilteredFacilities(facilities)
      }
    },
    selectedView: {
      get() {
        return this.facilitySelectedView
      },
      set(val) {
        this.$store.dispatch('facility/selectedView', val)
      }
    },
    facilityDataset() {
      return this.$store.getters['facility/dataset']
    },
    regionId() {
      return this.$route.params.region
    },
    isNemRegion() {
      return this.$route.params.region === 'nem'
    },
    isAllRegion() {
      return this.$route.params.region === 'au'
    },

    queryTech() {
      const techs = this.$route.query.tech
        ? this.$route.query.tech.split(',')
        : []
      return techs.filter((t) => FUEL_TECHS.isValidFuelTech(t))
    },

    queryStatus() {
      const statuses = this.$route.query.status
        ? this.$route.query.status.split(',')
        : []
      return statuses.filter((t) => isValidFacilityStatus(t))
    },

    querySize() {
      const sizes = this.$route.query.size
        ? this.$route.query.size.split(',')
        : []
      return sizes.filter((t) => isValidFacilitySize(t))
    },

    facilitySortBy() {
      return this.$store.getters['facility/sortBy']
    },
    facilityOrderBy() {
      return this.$store.getters['facility/orderBy']
    },
    facilitySelectedStatuses() {
      return this.$store.getters['facility/selectedStatuses']
    },
    facilitySelectedTechs() {
      return this.$store.getters['facility/selectedTechs']
    },
    facilitySelectedView() {
      return this.$store.getters['facility/selectedView']
    },
    cardFilename() {
      return this.useDev
        ? `${this.baseUrl}opennem-facilities-dev.png`
        : `${this.baseUrl}opennem-facilities-${this.regionId}.png`
    }
  },

  watch: {
    facilityData() {
      this.updateFacilitiesData()
    },
    selectedTechs() {
      this.updateFacilitiesData()
    },
    selectedStatuses() {
      this.updateFacilitiesData()
    },
    selectedSizes() {
      this.updateFacilitiesData()
    },
    sortBy() {
      this.updateFacilitiesData()
    },
    orderBy() {
      this.updateFacilitiesData()
    },
    filterString() {
      this.updateFacilitiesData()
    }
  },

  mounted() {
    this.setAllowResize(false)
    this.$store.dispatch('currentView', 'facilities')
    this.sortBy = this.facilitySortBy
    this.orderBy = this.facilityOrderBy
    // this.selectedStatuses = this.facilitySelectedStatuses
    this.selectedStatuses = this.queryStatus
    this.selectedTechs = this.queryTech
    this.selectedSizes = this.querySize

    if (this.$route.query.status === undefined) {
      // set default to operating
      this.selectedStatuses = [FACILITY_OPERATING]
      this.updateQuery()
    }

    if (this.facilityDataset.length > 0) {
      this.facilityData = this.facilityDataset
      this.ready = true
    } else {
      this.fetchData()
    }
  },

  methods: {
    ...mapMutations({
      previousPath: 'facility/previousPath',
      setFilteredFacilities: 'facility/filteredFacilities',
      setQuery: 'app/facilitiesQuery',
      setAllowResize: 'regionEnergy/allowResize'
    }),
    fetchData() {
      const urls = []
      urls.push('/v3/geo/au_facilities.json')

      if (urls.length > 0) {
        Http(urls)
          .then((responses) => {
            this.handleResponses(responses)
          })
          .catch((e) => {
            console.error(e)
          })
      } else {
        console.warn('fetchData', 'No urls provided')
      }
    },

    handleResponses(responses) {
      if (responses.length > 0 && responses[0].features) {
        FacilityDataParse.flattenV3(responses[0].features).then((res) => {
          this.facilityData = res
          this.ready = true
          this.$store.dispatch('facility/dataset', res)
        })
      } else {
        console.warn('There is an issue parsing the response.')
      }
    },

    getColour(facility) {
      let selectedFt = null,
        count = 0

      this.selectedTechs.forEach((tech) => {
        if (_includes(facility.fuelTechs, tech)) {
          selectedFt = tech
          count += 1
        }
      })

      if (
        this.selectedTechs.length === 0 ||
        facility.fuelTechs.length === count
      ) {
        const ftCaps = facility.fuelTechRegisteredCap
        let highest = 0
        Object.keys(ftCaps).forEach((d) => {
          if (
            FUEL_TECHS.FUEL_TECH_CATEGORY[d] === FUEL_TECHS.SOURCE &&
            ftCaps[d] >= highest
          ) {
            selectedFt = d
            highest = ftCaps[d]
          }
        })
      }

      const ftColour = FUEL_TECHS.DEFAULT_FUEL_TECH_COLOUR[selectedFt]
      return ftColour || 'lightgrey'
    },

    updateFacilitiesData() {
      const sortedData = _orderBy(
        this.facilityData,
        [
          (d) => {
            if (this.selectedTechs.length === 0) {
              return d[this.sortBy]
            }
            if (this.sortBy !== 'generatorCap') {
              return d[this.sortBy]
            }
            let totals = 0
            this.selectedTechs.forEach((ft) => {
              totals += d.fuelTechRegisteredCap[ft] || 0
            })
            return totals
          }
        ],
        [this.orderBy]
      )

      const filtered = sortedData.filter((d) => {
        if (this.selectedSizes.length === 0) {
          return true
        }

        let check = false
        this.selectedSizes.forEach((s) => {
          if (FACILITY_SIZE[s](d.generatorCap)) {
            check = true
          }
        })

        return check
      })

      const that = this
      let regionIds = [this.regionId]
      if (this.regionId === 'au') {
        regionIds = []
      } else if (this.regionId === 'nem') {
        regionIds = getNEMRegionArray()
      }

      async function updateFilter() {
        return filtered.filter(
          (g) =>
            g.displayName
              .toLowerCase()
              .includes(that.filterString.toLowerCase()) &&
            (regionIds.length === 0 ||
              (regionIds.length > 0 &&
                _includes(regionIds, g.regionId.toLowerCase()))) &&
            (that.selectedStatuses.length <= 0 ||
              g.unitStatuses.some((r) => that.selectedStatuses.includes(r))) &&
            (that.selectedTechs.length <= 0 ||
              g.fuelTechs.some((r) => that.selectedTechs.includes(r)))
        )
      }

      updateFilter().then((facilities) => {
        that.filteredFacilities = _cloneDeep(facilities)
        that.totalFacilities = facilities.length
        that.filteredFacilities.forEach((f) => {
          f.colour = that.getColour(f)
        })

        const exportData = facilities.map((d) => {
          // eslint-disable-line
          const region = FacilityRegions.find((r) => r.id === d.regionId)
          return {
            'Facility Name': d.displayName,
            Status: d.status,
            Region: region ? region.label : '',
            Technology: d.fuelTechs.map((ft) => FUEL_TECHS.FUEL_TECH_LABEL[ft]),
            'Generator Capacity (MW)': d.generatorCap,
            Latitude: d.location.latitude,
            Longitude: d.location.longitude
          }
        })

        that.$store.dispatch('facilityExportData', exportData)
      })
    },

    toggleOrder(order) {
      return order === ASCENDING ? DESCENDING : ASCENDING
    },

    setFilterString(string) {
      this.filterString = string
      this.updateFacilitiesData()
    },

    handleFacilityNameFilter(string) {
      this.filterString = string
    },
    handleOrderChange(orderName) {
      if (this.sortBy === orderName) {
        this.orderBy = this.toggleOrder(this.orderBy)
      } else {
        this.orderBy = ASCENDING
      }
      this.sortBy = orderName

      this.$store.dispatch('facility/sortBy', this.sortBy)
      this.$store.dispatch('facility/orderBy', this.orderBy)
    },
    handleMapFacilitySelect(facilityId) {
      const find = this.facilityData.find((f) => f.facilityId === facilityId)
      this.handleFacilitySelect(find, false)
    },
    handleFacilitySelect(facility, shouldZoom) {
      this.selectedFacility = facility
      this.shouldZoomWhenSelected = shouldZoom
      this.updateQuery()
    },
    handleFacilityHover(facility, shouldZoom) {
      this.hoveredFacility = facility
      this.shouldZoomWhenSelected = shouldZoom
    },
    handleFacilityOut() {
      this.hoveredFacility = null
    },
    getQuery(selectedFacility, techs, statuses, sizes) {
      const join = (arr) => (arr.length > 0 ? arr.join(',') : '')
      const query = {}

      if (selectedFacility) {
        query.selected = selectedFacility.facilityId
      }
      if (techs.length) {
        query.tech = join(techs)
      }
      if (statuses.length) {
        query.status = join(statuses)
      }
      if (sizes.length) {
        query.size = join(sizes)
      }

      return query
    },
    updateQuery() {
      const query = this.getQuery(
        this.selectedFacility,
        this.selectedTechs,
        this.selectedStatuses,
        this.selectedSizes
      )

      this.setQuery(query)
      this.$router.push({
        params: { region: this.regionId },
        query
      })
    },
    handleTechsSelected(techs) {
      this.selectedTechs = techs
      this.$store.dispatch('facility/selectedTechs', techs)
      this.updateQuery()
    },
    handleStatusesSelected(statuses) {
      this.selectedStatuses = statuses
      this.$store.dispatch('facility/selectedStatuses', statuses)
      this.updateQuery()
    },
    handleSizesSelected(sizes) {
      this.selectedSizes = sizes
      this.$store.dispatch('facility/selectedSizes', sizes)
      this.updateQuery()
    },
    handleCloseDetail() {
      this.selectedFacility = null
    },
    handleMapFacilityOpen(facilityId) {
      const find = this.facilityData.find((f) => f.facilityId === facilityId)
      this.handleOpenFacilityView(find)
    },
    handleOpenFacilityView(facility) {
      this.handleFacilitySelect(facility, true)
      this.previousPath(this.$route.path)

      const id = facility.facilityId
      const network = facility.network
      const country = facility.country
      this.$router.push({
        path: `/facility/${encodeURIComponent(country)}/${encodeURIComponent(
          network
        )}/${encodeURIComponent(id)}/`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.facility-filters {
  position: sticky;
  top: 0;
  background-color: $beige-lighter;
  z-index: 99;
}

.facility-list-map-container {
  @include tablet {
    padding: 1rem;
    display: flex;
  }

  .facility-list {
    @include tablet {
      width: 50%;
      padding: 0 1rem;
      padding-left: 0;
    }
  }
  .facility-map {
    padding-top: 1rem;
    border-radius: 10px;
    @include tablet {
      width: 50%;
      position: fixed;
      right: 0;
      top: 25px;
      z-index: 99;
      padding: 0 1rem 0 0;
    }
  }
}
</style>
