<template>
  <div class="panel-toggle-btns" v-if="isExportPng">
    <button class="price-btn button is-small is-rounded is-primary is-inverted"
      :class="{ 
        'on': showPricePanel,
        'off': !showPricePanel,
        'temperature-on': showTemperaturePanel,
        'temperature-off': !showTemperaturePanel,
      }"
      @click="togglePricePanel">
      <span v-if="showPricePanel"><font-awesome-icon class="fas" :icon="iconRemove" /></span>
      <span v-else>Show Price</span>
    </button>

    <button class="temperature-btn button is-small is-rounded is-primary is-inverted"
      :class="{
        'on': showTemperaturePanel,
        'off': !showTemperaturePanel,
        'price-on': showPricePanel,
        'price-off': !showPricePanel,
      }"
      @click="toggleTemperaturePanel">
      <span v-if="showTemperaturePanel"><font-awesome-icon class="fas" :icon="iconRemove" /></span>
      <span v-else>Show Temperature</span>
    </button>

    <button class="legend-btn button is-small is-rounded is-primary is-inverted"
      :class="{
        'on': showSummaryPanel,
        'off': !showSummaryPanel,
        'temperature-on': showTemperaturePanel,
        'temperature-off': !showTemperaturePanel,
        'price-on': showPricePanel,
        'price-off': !showPricePanel,
      }"
      @click="toggleSummaryPanel">
      <span v-if="showSummaryPanel"><font-awesome-icon class="fas" :icon="iconRemove" /></span>
      <span v-else>Show Summary</span>
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import {
  faCheck,
  faTimesCircle,
} from '@fortawesome/fontawesome-free-solid';

export default {
  name: 'export-panel-buttons',
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      isExportPng: 'isExportPng',
      showPricePanel: 'showPricePanel',
      showTemperaturePanel: 'showTemperaturePanel',
      showSummaryPanel: 'showSummaryPanel',
    }),
    iconOn() {
      return faCheck;
    },
    iconRemove() {
      return faTimesCircle;
    },
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    toggleTemperaturePanel() {
      this.$store.dispatch('setTemperaturePanel', !this.showTemperaturePanel);
    },
    togglePricePanel() {
      this.$store.dispatch('setPricePanel', !this.showPricePanel);
    },
    toggleSummaryPanel() {
      this.$store.dispatch('setSummaryPanel', !this.showSummaryPanel);
    },
  },
};
</script>

<style lang="scss" scoped>
.panel-toggle-btns {
  position: absolute;
  top: 0;
  z-index: 9;

  button {
    float: right;
    clear: both;
    display: block;
    margin-bottom: 0.2rem;
    position: absolute;
    padding-right: 10px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;

    .fas {
      position: relative;
      top: 1px;
      font-size: 18px;
    }

    &.on {
      margin-left: -41px;
      padding-right: 0;

      .fas {
        position: relative;
        left: -5px;
        top: -1px;
      }

      &:active,
      &:focus {
        outline: none;
        box-shadow: none;
      }
    }
    
  }

  .price-btn {
    top: 322px;
    margin-left: -96px;

    &.on.temperature-off {
      top: 277px;
    }
    &.off {
      top: 200px;
    }
  }
  
  .temperature-btn {
    top: 475px;
    margin-left: -139px;

    &.on.price-off {
      top: 303px;
    }
    &.off.price-on {
      top: 390px;
    }
    &.off.price-off {
      top: 235px;
    }
  }
  .legend-btn {
    top: 582px;
    margin-left: -121px;

    &.on.price-off {
      top: 442px;
    }
    &.on.temperature-off {
      top: 435px;
    }
    &.on.price-off.temperature-off {
      top: 285px;
    }

    &.off.price-on.temperature-on {
      top: 580px;
    }
    &.off.price-on.temperature-off {
      top: 435px;
    }
    &.off.price-off.temperature-on {
      top: 445px;
    }
    &.off.price-off {
      top: 295px;
    }
    &.off.price-off.temperature-off {
      top: 280px;
    }
  }
}
</style>