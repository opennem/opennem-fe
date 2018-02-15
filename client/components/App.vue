<template>
  <div id="app" v-on:click="hideSelectors()">
    <div class="alerts-banner" v-if="!isWidgetRoute()">OpenNEM is currently in active development</div>
    <header v-if="!isWidgetRoute()" style="padding: 0 1rem;">
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

select,
option,
button {
  font-family: "Merriweather", serif;
}

header {
  /* position: sticky;
  top: 40px;
  z-index: 99; */
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

footer {
  font-size: 0.8em;
  color: #999;
  margin: 40px 0 20px;
  padding-top: 13px;

  .smallprint {
    
  }
}

a {
  color: #C74523;
  /* border-bottom: 1px solid rgba(199,69,35,0.9); */
  /* text-decoration: none; */
  text-decoration: underline dotted rgba(199,69,35,0.6);
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
  max-width: 1400px;
  margin: 0 auto;
}

.router-view {
  /* min-height: 400px; */
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

.amcharts-value-axis .amcharts-axis-label {
  fill: #000;
  text-shadow: 2px 2px 2px rgba(200,200,200,.5);
}
.amcharts-stock-panel-div-stockPanel1 {
  .amcharts-category-axis {
    .amcharts-axis-line {
      stroke-opacity: 0;
    }
  }

  .amcharts-value-axis {
    g:first-child .amcharts-axis-grid {
      stroke-opacity: 0;
    }
  }
}
.amcharts-stock-panel-div-stockPanel2 {
  .amcharts-category-axis {
    .amcharts-axis-line {
      stroke-opacity: 0;
    }
  }

  .amcharts-value-axis {
    g:first-child .amcharts-axis-grid {
      stroke-opacity: 0;
    }
  }
}
.amcharts-stock-panel-div-stockPanel3 {
  .amcharts-category-axis {
    .amcharts-axis-line {
      stroke-opacity: 0;
    }
  }

  .amcharts-value-axis {
    g:first-child .amcharts-axis-grid {
      stroke-opacity: 0;
    }
  }
}
/* .amcharts-stock-panel-div-stockPanel4 {
  .amcharts-category-axis {
    .amcharts-axis-line {
      stroke-opacity: 1;
    }
  }

  .amcharts-value-axis {
    g:first-child .amcharts-axis-grid {
      stroke-opacity: 0;
    }
  }
} */
.amcharts-stock-panel-div-stockPanel2 {
  margin-top: -11px !important;
}
.export .amcharts-stock-panel-div-stockPanel2 {
  margin-top: -11px !important;
}
.amcharts-stock-panel-div-stockPanel3 {
  margin-top: -2px !important;
}
.export .amcharts-stock-panel-div-stockPanel3 {
  margin-top: -1px !important;
}
.amcharts-stock-panel-div-stockPanel4 {
  margin-top: -2px !important;
}
.export .amcharts-stock-panel-div-stockPanel4 {
  margin-top: -1px !important;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
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
  .amcharts-stock-panel-div-stockPanel2 {
    margin-top: -12px !important;
  }
  .amcharts-stock-panel-div-stockPanel3 {
    margin-top: -2px !important;
  }
  .amcharts-stock-panel-div-stockPanel4 {
    margin-top: -2px !important;
  }
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
