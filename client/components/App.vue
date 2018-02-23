<template>
  <div id="app" v-on:click="hideSelectors()">
    <div class="alerts-banner" v-if="!isWidgetRoute()">OpenNEM is currently in active development</div>
    <header v-if="!isWidgetRoute()">
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

    <router-view class="router-view"></router-view>

    <footer v-if="!isWidgetRoute()" style="padding: 0 1rem;">
      <p style="">Source: <a href="https://www.aemo.com.au/">AEMO</a>, <a href="http://www.bom.gov.au/">BOM</a></p>
      <p class="smallprint">OpenNEM is a project of the <a href="http://energy-transition-hub.org/">Energy Transition Hub</a></p>
    </footer>
  </div>
</template>

<script>
import { FUEL_TECH, REGIONS } from "../utils/FuelTechConfig";

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


<style>
@import url('../../node_modules/formbase/dist/formbase.min.css');
@import url("https://fonts.googleapis.com/css?family=Merriweather:300,400,700");

@import url('../styles/loader.css');
@import url('../styles/transitions.css');
@import url('../styles/chart.css');


select,
option,
button {
  font-family: "Merriweather", serif;
}

a {
  color: #C74523;
  /* border-bottom: 1px solid rgba(199,69,35,0.9); */
  /* text-decoration: none; */
  text-decoration: underline dotted rgba(199,69,35,0.6);
}

#app {
  max-width: 1400px;
  margin: 0 auto;

  > header {
    padding: 0 1rem;
    display: flex;
    flex: 1;
    margin: 50px 0 10px;

    h1 {
      font-size: 1.1em;
      font-weight: 200;
      /* padding: 3px 0 13px; */
      flex-grow: 1;
      text-align: right;
      padding-right: 20px;
      border-right: 1px dashed #ccc;
    }

    .menu-options {
      flex-grow: 1;
      width: 100%;
      padding-left: 20px;
    }

    img {
      height: 40px;
      transition: all 0.25s linear;
    }
  }

  > footer {
    font-size: 0.8em;
    color: #999;
    margin: 40px 0 20px;
    padding-top: 13px;

    .smallprint {
      
    }
  }
}

.selection {
  display: inline-block;
  position: relative;
  cursor: pointer;
  color: #C74523;
  position: relative;
  top: 18px;

  &.week-selection {
    width: 130px;
    margin: 0;
    font-size: 12px;
  }

  &.region-selection {
    margin: 0;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .selected {
    padding: 3px 0 0;
    font-size: 1.1em;
    margin-right: 5px;
    /* text-decoration: underline solid rgba(199,69,35,0.9); */
    border-bottom: 1px dashed rgba(199,69,35,0.7);

    &:hover {
      border-bottom-style: solid;
    }
  }
  .selection-options {
    width: 160px;
    list-style-type: none;
    position: absolute;
    left: -10px;
    background: rgba(255,255,255,0.9);
    border-radius: 6px;
    margin: 0;
    padding: 0;
    z-index: 99;
    box-shadow: rgba(0,0,0,0.2) 0px 10px 20px;

    li {
      padding: 0.3rem 0.7rem;

      &:first-child {
        border-radius: 6px 6px 0 0;
      }

      &:last-child {
        border-radius: 0 0 6px 6px;
      }

      &:hover {
        color: #fff;
        background: rgba(199,69,35,0.9);
      }
    }
  }

}
.alerts-banner {
  background-color: #C74523;
  text-align: center;
  color: #fff;
  font-weight: light;
  font-size: 0.8em;
  padding: 10px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  opacity: 0.9;
  z-index: 99;
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

@media only screen and (min-width: 960px) {
  header {
    img {
      height: 45px;
    }
  }
  .selection {
    top: 15px;
  }
  .selection.region-selection {
    font-size: 1.3rem;
  }
  .selection .selection-options { 
    left: -20px;
    width: 250px;
  }
  .selection .selection-options li {
    padding: 0.5rem 1.2rem;
  }
  .smallprint {
    float: right; 
    margin-top: -29px;
  }
}

</style>
