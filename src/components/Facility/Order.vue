<template>
  <div class="dropdown" :class="{'is-active': dropdownActive}" v-on-clickaway="onClickAway">
    <button
      class="dropdown-trigger button is-rounded is-small is-primary"
      :class="{ 'is-inverted': true }"
      @click="dropdownActive = true"
    >
      <div class="dropdown-label">
        <span>Order:</span>
        <strong>{{ selectedOrderLabel }}</strong>
      </div>
      <font-awesome-icon class="fal" :icon="iconDown" />
    </button>

    <transition name="slide-down-fade">
      <div v-if="dropdownActive" class="dropdown-menu">
        <div class="dropdown-content">
          <a
            v-for="(d, index) in orders"
            :key="index"
            :class="{ selected: orderBy === d.id }"
            class="dropdown-item"
            @click="handleClick(d.id)"
          >
            {{d.label}}
          </a>
        </div>
      </div>
    </transition> 
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faAngleDown } from '@fortawesome/fontawesome-pro-light';

const orders = [
  {
    id: 'asc',
    label: 'Ascending',
  },
  {
    id: 'desc',
    label: 'Descending',
  },
];

export default {
  mixins: [clickaway],

  components: {
    FontAwesomeIcon,
  },

  props: {
    orderBy: String,
  },

  data() {
    return {
      orders,
      order: '',
      dropdownActive: false,
    }
  },

  computed: {
    iconDown() {
      return faAngleDown;
    },
    selectedOrderLabel() {
      return this.orders.find(s => s.id === this.orderBy).label;
    },
  },

  watch: {
    orderBy(newValue) {
      this.order = newValue;
    },
  },

  mounted() {
    this.order = this.orderBy;
  },

  methods: {
    onClickAway() {
      this.dropdownActive = false;
    },
    handleClick(order) {
      this.dropdownActive = false;
      this.$emit('orderChanged', order);
    },
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.dropdown-label {
  margin-right: 0.5rem;
}
.dropdown-content {
  font-family: $primary-font-family;

  .dropdown-item {
    font-size: 12px;
  }
}
</style>

