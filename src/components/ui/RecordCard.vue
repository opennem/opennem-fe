<template>
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">
        <span>{{title}}</span>
        <small>{{titleUnit}}</small>
      </p>
    </header>

    <div class="card-content">

      <div class="main-stats">
        <div class="stat"
          @mouseover="emitHover(min)"
          @mouseout="emitOut"
        >
          <span class="stat-label">Min</span>
          <span class="stat-value">{{ min.value | formatNumber(formatString) }}{{unit}}</span>
        </div>
        <div class="stat"
          @mouseover="emitHover(max)"
          @mouseout="emitOut"
        >
          <span class="stat-label">Max</span>
          <span class="stat-value">{{ max.value | formatNumber(formatString) }}{{unit}}</span>
        </div>
      </div>
      

      <div class="compare" v-if="compare">
        <header class="card-body-header">
          <p class="card-header-title">
            <span>Renewables</span>
            <small>%</small>
          </p>
        </header>

        <div class="stat"
          @mouseover="emitHover(compareMin)"
          @mouseout="emitOut"
        >
          <span class="stat-label">Min</span>
          <span class="stat-value">{{ compareMin.value | formatNumber }}%</span>
        </div>
        <div class="stat"
          @mouseover="emitHover(compareMax)"
          @mouseout="emitOut"
        >
          <span class="stat-label">Max</span>
          <span class="stat-value">{{ compareMax.value | formatNumber }}%</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '@/lib/event-bus';

export default {
  name: 'record-card',
  props: {
    title: String,
    titleUnit: String,
    unit: String,
    min: Object,
    max: Object,
    formatString: String,
    compare: Boolean,
    compareMin: Object,
    compareMax: Object,
  },
  computed: {
  },
  filters: {
  },
  methods: {
    emitHover(data) {
      EventBus.$emit('extent.event.hover', data.date);
    },
    emitOut() {
      EventBus.$emit('extent.event.out');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../node_modules/bulma/sass/utilities/mixins.sass";
@import "../../styles/variables.scss";

.card {
  font-size: 0.8em;
  box-shadow: none;
  border: 1px solid #ddd;

  .card-header {
    box-shadow: none;
    background-color: #ece9e6;
  }

  .card-body-header {
    background-color: #ece9e6;
    clear: both;
  }

  .card-header-title {
    padding: .3rem 1rem;
    font-family: $header-font-family;
    font-size: 0.8rem;

    span {
      text-transform: uppercase;
      margin-right: 5px;
    }
    small {
      position: relative;
      top: 1px;
      color: #666;
    }
  }

  .card-content {
    padding: 0;
    background-color: #fff;

    &:after {
      content: '';
      display: table;
      clear: both;
    }
  }
}

.main-stats {
  &:after {
    content: '';
    display: table;
    clear: both;
  }
}

.stat {
  float: left;
  width: 50%;
  padding: .3rem 1rem;

  &:hover {
    background-color: #f7f5f4;
  }

  .stat-label {
    text-transform: uppercase;
    font-family: $header-font-family;
    display: block;
    font-weight: 600;
    font-size: 0.7rem;
    position: relative;
    top: 3px;
    color: #999;
  }

  .stat-value {
    font-family: $numbers-font-family;
    font-size: 0.9rem;
    position: relative;
    top: -3px;
    color: #000;

    @include widescreen {
      font-size: 1.3rem;
    }
    @include mobile {
      font-size: 1.3rem;
    }
  }
}
</style>

