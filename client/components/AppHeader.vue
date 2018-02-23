<template>
  <header>
    <h1 style=""><img src="/images/logotype.png" alt=""></h1>

    <!-- <div class="selection week-selection">
      <div class="selected" v-on:click.stop="toggleWeekSelector(true)">
        {{getWeekLabel(selectedWeek)}}
      </div>

      <transition name="fade">
        <ol class="selection-options" v-if="showWeekSelector">
          <li
            v-for="week in weeks"
            :key="week.id"
            v-on:click="onWeekRangeChange(week.id)"
            v-if="selectedWeek !== week.id">{{week.label}}</li>
        </ol>
      </transition>
    </div> -->
    <!-- <br> -->

    <div class="menu-options">
      <div class="selection region-selection">
        <div class="selected" v-on:click.stop="toggleRegionSelector(true)">
          {{getRegionLabel(selectedRegion)}}
        </div>

        <transition name="fade">
          <ol class="selection-options" v-if="showRegionSelector">
            <li
              v-for="region in regions"
              :key="region.id"
              v-on:click="onRegionChange(region.id)"
              v-if="selectedRegion !== region.id">{{region.label}}</li>
          </ol>
        </transition>
      </div>

      <div class="selection" v-if="showFTSelector">
        <span style="color: #333; font-size: 24px;">/ {{getFTLabel(selectedFT)}}</span>  
      </div>
    </div>
  </header>
</template>
<script>
import { FUEL_TECH, REGIONS } from "../utils/FuelTechConfig";
import EventBus from '../utils/EventBus';

const weeks = [
  {
    id: '2017-11-04',
    label: '04 Nov 2017'
  },
  {
    id: '2017-10-28',
    label: '28 Oct 2017'
  },
  {
    id: '2017-10-21',
    label: '21 Oct 2017'
  },
  {
    id: '2017-10-14',
    label: '14 Oct 2017'
  },
  {
    id: '2017-10-02',
    label: '02 Oct 2017'
  },
  {
    id: 'all',
    label: 'Max'
  },
]

export default {
  data() {
    return {
      regions: REGIONS,
      weeks,
      selectedRegion: REGIONS[0].id,
      selectedWeek: weeks[4].id,
      selectedFT: null,
      showRegionSelector: false,
      showWeekSelector: false,
      showFTSelector: false
    }
  },
  mounted() {
    this.checkRoute(this.$route)
    this.selectedRegion = this.$route.name === 'home' ? this.regions[0].id : this.$route.params.region
    this.selectedFT = this.$route.name === 'generators' ? this.$route.params.ft : null
    this.$store.commit('updateRegionId', this.selectedRegion)
    this.onWeekRangeChange(weeks[4].id)

    EventBus.$on('menu-hide', () => {
      this.hideSelectors()
    });
  },
  watch: {
    $route: 'checkRoute',
  },
  methods: {
    isWidgetRoute() {
      return this.$route.name === 'widget'
    },
    onRegionChange(regionId) {
      this.selectedRegion = regionId
      this.showRegionSelector = false
      this.$store.commit('updateRegionId', regionId)

      if (regionId === 'all') {
        this.$router.push({ name: 'home' })
      } else {
        this.$router.push({ name: 'regions', params: { region: regionId } })
      }
    },
    onWeekRangeChange(week) {
      this.selectedWeek = week

      if (week === 'all') {
        this.$router.push({ name: 'max', params: { region: 'sa' } })
      }

      this.$store.commit('updateWeekStarting', week)
    },
    getRegionLabel(id) {
      const region = id === undefined ? this.regions[0] : this.regions.find(r => r.id === id)
      return region.label
    },
    getFTLabel(id) {
      const label = FUEL_TECH[id] ? FUEL_TECH[id].label : id
      return label
    },
    getWeekLabel(id) {
      const week = this.weeks.find(r => r.id === id)
      return week.label
    },
    toggleRegionSelector(toggle) {
      this.showWeekSelector = false
      this.showRegionSelector = toggle
    },
    toggleWeekSelector(toggle) {
      this.showRegionSelector = false
      this.showWeekSelector = toggle
    },
    checkRoute(route) {
      const regionId = route.params.region
      const ft = route.params.ft
      this.showFTSelector = route.name === 'generators' ? true : false

      if (regionId !== undefined) {
        this.selectedRegion = regionId
        this.$store.commit('updateRegionId', regionId)
      } else {
        this.selectedRegion = 'all'
        this.$store.commit('updateRegionId', 'all')
      }
      if (ft !== undefined) {
        this.selectedFT = ft
      }
    },
    hideSelectors() {
      this.toggleRegionSelector(false)
      this.toggleWeekSelector(false)
    }
  }
}
</script>