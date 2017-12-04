<template>
  <div id="app">
    <header>
      <h2>
      <select v-model="selectedRegion" v-on:change="onRegionChange">
        <option v-for="region in regions" :key="region.id" :value="region.id">
          {{ region.label }}
        </option>
      </select>
      </h2>
      <div class="date-range">
        <select class="week-selector" v-on:change="onWeekRangeChange">
          <option value="2017-11-04">Week starting 04 Nov 2017</option>
          <option value="2017-10-28">Week starting 28 Oct 2017</option>
          <option value="2017-10-21">Week starting 21 Oct 2017</option>
          <option value="2017-10-14">Week starting 14 Oct 2017</option>
          <option value="2017-10-02">Week starting 02 Oct 2017</option>
        </select>
      </div>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
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

export default {
  data() {
    return {
      regions,
      selectedRegion: this.$route.params.region
    }
  },
  methods: {
    onRegionChange(event) {
      console.log(this.$route.params.region)
      console.log(event.target.value)
      if (event.target.value === 'all') {
        this.$router.replace({ name: 'home' })
      } else {
        this.$router.replace({ name: 'regions', params: { region: event.target.value } })
      }
    },
    onWeekRangeChange(event) {
      // this.weekStarting = event.target.value
      this.$store.commit('updateWeekStarting', event.target.value)
      // this.fetchData()
    },
  }
}
</script>


<style>
/* @import url('https://fonts.googleapis.com/css?family=Raleway:700'); */
/* @import url("https://fonts.googleapis.com/css?family=Merriweather:300,400,700"); */

body {
  background: #ece9e6;
  font-family: -apple-system, BlinkMacSystemFont, 'avenir next', avenir, helvetica, 'helvetica neue', Ubuntu, 'segoe ui', arial, sans-serif;
  /* font-family: "Merriweather", serif; */
}
select,
option {
  /* font-family: "Merriweather", serif; */
}

h2 {
  font-weight: 700;
  margin: 0;
  padding: 0 0 10px;
  border-bottom: 1px solid #000;
}

a[title="JavaScript charts"],
a[title="Interactive JavaScript maps"] {
  display: none !important;
}

#app {
  padding: 2rem;
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
