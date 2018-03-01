<template>
  <div id="app" v-on:click="emitHideMenuEvent()">
    <!-- <div class="alerts-banner" v-if="!isWidgetRoute()">OpenNEM is currently in active development</div> -->
    
    <AppHeader v-if="!isWidgetRoute()"></AppHeader>
    <router-view class="router-view"></router-view>
    <AppFooter v-if="!isWidgetRoute()" v-bind:class="{ 'not-homepage': !isHomePage() }"></AppFooter>
  </div>
</template>

<script>
import AppHeader from './AppHeader.vue'; 
import AppFooter from './AppFooter.vue'; 
import EventBus from '../utils/EventBus';

export default {
  components: {
    AppHeader,
    AppFooter
  },
  data() {
    return {}
  },
  mounted() {},
  watch: {
    $route: 'checkRoute',
  },
  methods: {
    isWidgetRoute() {
      return this.$route.name === 'widget'
    },
    isHomePage() {
      return this.$route.name === 'home'
    },
    emitHideMenuEvent() {
      EventBus.$emit('menu-hide');
    },
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
  border-bottom: 1px solid rgba(199,69,35,0.9);
  text-decoration: none;
  /* text-decoration: underline dotted rgba(199,69,35,0.6); */

  &.no-border {
    border-bottom: none;
  }
}

#app {
  max-width: 1400px;
  margin: 0 auto;

  > header {
    padding: 0 1rem;
    display: flex;
    flex: 1;
    margin: 2.3rem 0;

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
      height: 55px;
      transition: all 0.25s linear;
    }
  }
}

footer.not-homepage {
  margin-top: 20px !important;
}

.router-view {
  min-height: 300px;
}

.selection {
  display: inline-block;
  position: relative;
  cursor: pointer;
  color: #C74523;
  position: relative;
  top: 28px;

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
    top: 22px;
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
}

</style>
