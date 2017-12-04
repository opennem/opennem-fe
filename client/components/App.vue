<template>
  <div id="app" v-on:click="hideSelectors()">
    <header>
      <div class="selection" style="width: 190px;">
        <div class="selected" 
          v-on:click.stop="toggleRegionSelector(true)"
          >
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

      <!-- <div class="selection" style="width: 190px;" v-if="showFTSelector">
        <div class="selected" 
          v-on:click.stop="toggleRegionSelector(true)"
          >
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
      </div> -->

      <div class="selection" style="width: 300px;">
        <div class="selected" 
          v-on:click.stop="toggleWeekSelector(true)"
          >
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
      
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
import { FUEL_TECH } from "../utils/FuelTechConfig";
const regions = [
  {
    id: 'all',
    label: 'All NEM Regions'
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
    label: 'Week starting 04 Nov 2017'
  },
  {
    id: '2017-10-28',
    label: 'Week starting 28 Oct 2017'
  },
  {
    id: '2017-10-21',
    label: 'Week starting 21 Oct 2017'
  },
  {
    id: '2017-10-14',
    label: 'Week starting 14 Oct 2017'
  },
  {
    id: '2017-10-02',
    label: 'Week starting 02 Oct 2017'
  },
]

export default {
  data() {
    return {
      regions,
      weeks,
      selectedRegion: regions[0].id,
      selectedWeek: weeks[4].id,
      showRegionSelector: false,
      showWeekSelector: false,
      showFTSelector: false
    }
  },
  mounted() {
    this.checkRoute(this.$route)
    this.selectedRegion = this.$route.name === 'home' ? regions[0].id : this.$route.params.region 
    this.onWeekRangeChange(weeks[4].id)
  },
  watch: {
    $route: 'checkRoute',
  },
  methods: {
    onRegionChange(regionId) {
      this.selectedRegion = regionId
      if (regionId === 'all') {
        this.$router.replace({ name: 'home' })
      } else {
        this.$router.replace({ name: 'regions', params: { region: regionId } })
        this.$store.dispatch('fetchData', { region: regionId })
      }
    },
    onWeekRangeChange(week) {
      // this.weekStarting = event.target.value
      this.$store.commit('updateWeekStarting', week)
      // this.fetchData()
    },
    getRegionLabel(id) {
      const region = id === undefined ? regions[0] : this.regions.find(r => r.id === id)
      return region.label
    },
    getWeekLabel(id) {
      const week = this.weeks.find(r => r.id === id)
      return week.label
    },
    toggleRegionSelector(toggle) {
      this.showRegionSelector = toggle
    },
    toggleWeekSelector(toggle) {
      this.showWeekSelector = toggle
    },
    checkRoute(route) {
      this.showFTSelector = route.name === 'generators' ? true : false
    },
    hideSelectors() {
      this.toggleRegionSelector(false)
      this.toggleWeekSelector(false)
    }
  }
}
</script>


<style>
/* @import url('https://fonts.googleapis.com/css?family=Raleway:700'); */
/* @import url("https://fonts.googleapis.com/css?family=Merriweather:300,400,700"); */
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
body {
  background: #ece9e6;
  font-family: -apple-system, BlinkMacSystemFont, 'avenir next', avenir, helvetica, 'helvetica neue', Ubuntu, 'segoe ui', arial, sans-serif;
  /* font-family: "Merriweather", serif; */
}
select,
option {
  /* font-family: "Merriweather", serif; */
}

header {
  font-weight: 700;
  margin: 0;
  padding: 0 0 10px;
  border-bottom: 1px solid #000;
}

a {
  color: steelblue;
  text-decoration: none;
}
a[title="JavaScript charts"],
a[title="Interactive JavaScript maps"] {
  display: none !important;
}

#app {
  padding: 2rem;
}

.selection {
  display: inline-block;
  position: relative;
  cursor: pointer;

  .selected {
    width: 100%;
    background: #D5D1CF;
    padding: 10px 20px;
  }
  .selection-options {
    list-style-type: none;
    position: absolute;
    background: #D5D1CF;
    margin: 0;
    padding: 0;
    width: 100%;
    z-index: 99;
    
    li {
      padding: 10px 20px;

      &:hover {
        background: #B9B6B5;
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
