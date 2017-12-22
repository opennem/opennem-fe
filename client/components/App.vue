<template>
  <div id="app" v-on:click="hideSelectors()">
    <header>
      <h1>Visualising how Australia generates its electricity</h1>

      <div class="selection week-selection">
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
      </div>
      <br>
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

      <div v-if="showFTSelector">
        {{getFTLabel(selectedFT)}}
      </div>
    </header>

    <router-view class="router-view"></router-view>

    <footer>
      sources: <a href="https://www.aemo.com.au/">Australia Electricity Market Operator</a>
    </footer>
  </div>
</template>

<script>
import { FUEL_TECH } from "../utils/FuelTechConfig";
const regions = [
  {
    id: 'all',
    label: 'All Regions'
  },
  {
    id: 'nsw',
    label: 'New South Wales'
  },
  {
    id: 'qld',
    label: 'Queensland'
  },
  {
    id: 'sa',
    label: 'South Australia'
  },
  {
    id: 'tas',
    label: 'Tasmania'
  },
  {
    id: 'vic',
    label: 'Victoria'
  }
]
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
]

export default {
  data() {
    return {
      regions,
      weeks,
      selectedRegion: regions[0].id,
      selectedWeek: weeks[4].id,
      selectedFT: null,
      showRegionSelector: false,
      showWeekSelector: false,
      showFTSelector: false
    }
  },
  mounted() {
    this.checkRoute(this.$route)
    this.selectedRegion = this.$route.name === 'home' ? regions[0].id : this.$route.params.region
    this.selectedFT = this.$route.name === 'generators' ? this.$route.params.ft : null
    this.$store.commit('updateRegionId', this.selectedRegion)
    this.onWeekRangeChange(weeks[4].id)
  },
  watch: {
    $route: 'checkRoute',
  },
  methods: {
    onRegionChange(regionId) {
      this.selectedRegion = regionId
      this.$store.commit('updateRegionId', regionId)

      if (regionId === 'all') {
        this.$router.push({ name: 'home' })
      } else {
        this.$router.push({ name: 'regions', params: { region: regionId } })
      }
    },
    onWeekRangeChange(week) {
      this.selectedWeek = week
      this.$store.commit('updateWeekStarting', week)
    },
    getRegionLabel(id) {
      const region = id === undefined ? regions[0] : this.regions.find(r => r.id === id)
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


<style>
@import url("https://fonts.googleapis.com/css?family=Merriweather:300,400,700");
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
body {
  background: #ece9e6;
  /* font-family: -apple-system, BlinkMacSystemFont, 'avenir next', avenir, helvetica, 'helvetica neue', Ubuntu, 'segoe ui', arial, sans-serif; */
  font-family: "Merriweather", serif;
}
select,
option {
  font-family: "Merriweather", serif;
}

header {
  text-align: left;
  margin-bottom: 20px;

  h1 {
    font-size: 1.1em;
    font-weight: 200;
    padding: 3px 0 13px;
  }
}

footer {
  font-size: 0.8em;
  color: #999;
  margin: 40px 0 20px;
  padding-top: 13px;
}

a {
  color: #C74523;
  text-decoration: none;
}
a[title="JavaScript charts"],
a[title="Interactive JavaScript maps"] {
  display: none !important;
}

.amcharts-axis-label {
  text-anchor: start;

  tspan {
    white-space: pre;
  }
}


#app {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

.router-view {
  min-height: 400px;
}

.selection {
  display: inline-block;
  position: relative;
  cursor: pointer;
  color: #C74523;
  font-weight: 200;

  &.week-selection {
    width: 130px;
    margin: 0;
    font-size: 13px;
  }

  &.region-selection {
    width: 300px;
    margin: 0;
    font-weight: 500;
    font-size: 24px;
  }

  .selected {
    width: 100%;
    /* background: #D5D1CF; */
    padding: 3px 0;
    font-size: 1.3em;
  }
  .selection-options {
    list-style-type: none;
    position: absolute;
    background: rgba(255,255,255,0.9);
    margin: 0;
    padding: 0;
    width: 100%;
    z-index: 99;
    box-shadow: rgba(0,0,0,0.2) 0px 10px 20px;

    li {
      padding: 5px 10px;

      &:hover {
        background: rgba(255,255,255,1);
      }

      &:last-child {
        /* padding-bottom: 15px; */
      }
    }
  }

}

.region-selector {
  background: none;
  font-size: 1.5rem;
  border: none;
  padding: 0 1rem;
  -webkit-appearance: none;
}
.week-selector {
  position: relative;
  top: -10px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}

/* loading icon */
.loader {
  font-size: 10px;
  margin: 50px auto;
  text-indent: -9999em;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  background: #000000;
  background: -moz-linear-gradient(left, #000000 10%, rgba(0, 0, 0, 0) 42%);
  background: -webkit-linear-gradient(left, #000000 10%, rgba(0, 0, 0, 0) 42%);
  background: -o-linear-gradient(left, #000000 10%, rgba(0, 0, 0, 0) 42%);
  background: -ms-linear-gradient(left, #000000 10%, rgba(0, 0, 0, 0) 42%);
  background: linear-gradient(to right, #000000 10%, rgba(0, 0, 0, 0) 42%);
  position: relative;
  -webkit-animation: load3 0.5s infinite linear;
  animation: load3 0.5s infinite linear;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}
.loader:before {
  width: 50%;
  height: 50%;
  background: #000000;
  border-radius: 100% 0 0 0;
  position: absolute;
  top: 0;
  left: 0;
  content: "";
}
.loader:after {
  background: #ece9e6;
  width: 75%;
  height: 75%;
  border-radius: 50%;
  content: "";
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
@-webkit-keyframes load3 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load3 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
