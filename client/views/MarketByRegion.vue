<template>
  <div>
    <header>
      <h2><select class="region-selector" v-on:change="onRegionSelectorChange">
        <option value="nsw1">New South Wales</option>
        <option value="qld1">Queensland</option>
        <option value="sa1">South Australia</option>
        <option value="tas1">Tasmania</option>
        <option value="vic1">Victoria</option>
      </select></h2>
      <div class="date-range">
        <!-- <time>2 Mar '17</time> — <time>7 Mar '17</time>     -->
      </div>
    </header>
    <Vis></Vis>
  </div>
</template>

<script>
import Vis from '../components/ElectricityPriceVis'

export default {
  components: {
    Vis
  },
  created() {
    this.$store.dispatch('fetchData', 'nsw1')
  },
  methods: {
    onRegionSelectorChange(event) {
      console.log(event.target.value)
      this.$store.dispatch('fetchData', event.target.value)
    }
  }
}

</script>

<style>

.region-selector {
  background: none;
  font-size: 1.5rem;
  border: none;
  padding: 0 1rem;
  -webkit-appearance: none;
}

.date-range {
  color: #666;
  position: absolute;
  right: 2rem;
  top: 2rem;
  margin-right: 1rem;
  margin-top: 1rem;
}

.loader {
  font-size: 10px;
  margin: 50px auto;
  text-indent: -9999em;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  background: #000000;
  background: -moz-linear-gradient(left, #000000 10%, rgba(0,0,0, 0) 42%);
  background: -webkit-linear-gradient(left, #000000 10%, rgba(0,0,0, 0) 42%);
  background: -o-linear-gradient(left, #000000 10%, rgba(0,0,0, 0) 42%);
  background: -ms-linear-gradient(left, #000000 10%, rgba(0,0,0, 0) 42%);
  background: linear-gradient(to right, #000000 10%, rgba(0,0,0, 0) 42%);
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
  content: '';
}
.loader:after {
  background: #fff;
  width: 75%;
  height: 75%;
  border-radius: 50%;
  content: '';
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
